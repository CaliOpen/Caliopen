import zope.interface

import types
import uuid
import datetime
import pytz
from six import add_metaclass

from caliopen_storage.exception import NotFound
import caliopen_main.common.errors as main_errors
from caliopen_main.common.interfaces import (IO, storage)
from elasticsearch import exceptions as ESexceptions

from caliopen_storage.core.base import CoreMetaClass
import logging

log = logging.getLogger(__name__)


class CaliopenObject(object):
    """
    Empty class to identify Caliopen objects/types.

    all custom classes should inherit from that
    """

    _attrs = {}

    def __init__(self, **kwargs):
        # TODO: type check and kwargs consistency check
        for k, v in kwargs.items():
            if k in self._attrs:
                if isinstance(self._attrs[k], list):
                    setattr(self, k, [])
                    att_list = getattr(self, k)
                    if isinstance(v, list):
                        for item in v:
                            if issubclass(self._attrs[k][0], CaliopenObject):
                                att_list.append(self._attrs[k][0](**item))
                            else:
                                att_list.append(item)
                    else:
                        if issubclass(self._attrs[k][0], CaliopenObject):
                            att_list.append(self._attrs[k][0](**v))
                        else:
                            att_list.append(v)
                elif issubclass(self._attrs[k], CaliopenObject):
                    setattr(self, k, self._attrs[k][0](v))
                else:
                    setattr(self, k, v)

        for attr, attrtype in self._attrs.items():
            if not hasattr(self, attr):
                if isinstance(attrtype, list):
                    setattr(self, attr, [])
                elif isinstance(attrtype, dict):
                    setattr(self, attr, {})
                else:
                    setattr(self, attr, None)

    def keys(self):
        """returns a list of current attributes"""

        return [k for k in self._attrs if hasattr(self, k)]

    def update_with(self, sibling):
        """update self attributes with those from sibling


        returns a list of first level attributes that have been modified
        """
        pass


class ObjectDictifiable(CaliopenObject):
    """Object that can marshall/unmarshall to/from python dict"""
    zope.interface.implements(IO.DictIO)

    def marshall_dict(self, **options):
        """output a dict representation of self 'public' attributes"""

        self_dict = {}
        for att, val in vars(self).items():
            if not att.startswith("_") and val is not None:
                if isinstance(self._attrs[att], types.ListType):
                    lst = []
                    if len(att) > 0:
                        if issubclass(self._attrs[att][0], ObjectDictifiable):
                            for item in val:
                                lst.append(item.marshall_dict())
                        else:
                            lst = val
                        self_dict[att] = lst
                    else:
                        self_dict[att] = lst
                elif issubclass(self._attrs[att], ObjectDictifiable):
                    self_dict[att] = val.marshall_dict()
                else:
                    self_dict[att] = val

        return self_dict

    def unmarshall_dict(self, document, **options):
        """squash self.attrs with dict input document

        all self.attrs are reset if not in document
        """
        for attr, attrtype in self._attrs.items():
            if attr in document and document[attr] is not None:
                unmarshall_item(document, attr, self, attrtype,
                                is_creation=False)
            else:
                if isinstance(attrtype, types.ListType):
                    setattr(self, attr, [])
                elif issubclass(attrtype, types.DictType):
                    setattr(self, attr, {})
                elif issubclass(attrtype, types.BooleanType):
                    setattr(self, attr, False)
                elif issubclass(attrtype, types.StringType):
                    setattr(self, attr, "")
                elif issubclass(attrtype, types.IntType):
                    setattr(self, attr, 0)
                else:
                    setattr(self, attr, None)


class ObjectJsonDictifiable(ObjectDictifiable):
    """Object can marshall/unmarshall to/from python json compatible dict

    A json compatible dict is a dict with only 4 value types :
                                                                str
                                                                num
                                                                bool
                                                                None
    We rely on schematics to do the job from our object's 'public' attributes
    """

    zope.interface.implements(IO.JsonDictIO)

    _json_model = None

    def marshall_json_dict(self, **options):
        d = self.marshall_dict()
        return self._json_model(d).serialize()

    def unmarshall_json_dict(self, document, **options):
        """ TODO: handle conversion of basic json type into obj. types"""

        # validate document against json_model before trying to unmarshal
        valid_doc = self._json_model(document)
        try:
            valid_doc.validate()
        except Exception as exc:
            log.warn("document validation failed with error {}".format(exc))
            raise exc

        self.unmarshall_dict(document, **options)


@add_metaclass(CoreMetaClass)
class ObjectStorable(ObjectJsonDictifiable):
    zope.interface.implements(storage.DbIO)

    _model_class = None  # cql model for object
    _db = None  # cql model instance
    _pkey_name = None  # name of primary key in cassandra
    _relations = None  # related tables into cassandra
    _lookup_class = None  #
    _lookup_values = None  # tables keys, values for lookups

    def get_db(self, **options):
        """Get a core object from database and put it in self._db attribute"""
        if self._pkey_name:
            param = {
                self._pkey_name: getattr(self, self._pkey_name)
            }
        else:
            param = {}
        self._db = self._model_class.get(**param)
        if self._db is None:
            raise NotFound('%s #%s not found.' %
                           (self.__class__.__name__,
                            getattr(self, self._pkey_name)))

    def save_db(self, **options):
        try:
            self._db.save()
        except Exception as exc:
            log.info(exc)
            return exc

        return None

    # def create_db(self, **options):
    #     """ Create an instance of this model in the database
    #
    #         from current object's attributes
    #     """
    #
    #     params = self.marshall_dict()
    #     p_key = params.pop(self._pkey_name)
    #     #primary key must be set as first argument for create
    #     try:
    #         self._db.create(p_key, params)
    #     except Exception as exc:
    #         log.info(exc)
    #         raise exc
    #
    #     return None

    def delete_db(self, **options):
        try:
            self._db.delete()
        except Exception as exc:
            log.info(exc)
            return exc

        return None

    def update_db(self, **options):
        """push updated model into db"""

        try:
            self._db.update()
        except Exception as exc:
            log.info(exc)
            return exc

        return None

    def marshall_db(self, **options):
        """squash self._db with self 'public' attributes

        self._db being a cqlengine Model, we can (re)set attributes one
        by one, cqlengine will do the job of changes logging to later make a
        smart update into the db
        """

        if not isinstance(self._db, self._model_class):
            self._db = self._model_class()

        self_keys = self._attrs.keys()
        for att in self._db.keys():
            if not att.startswith("_") and att in self_keys:
                # TODO : manage protected attrs
                # (ie attributes that user should not be able to change)
                if isinstance(self._attrs[att], list):
                    # TODO : manage change within list to only elem changed
                    # (use builtin set() collection ?)
                    if issubclass(self._attrs[att][0], CaliopenObject):
                        setattr(self._db, att,
                                [self._attrs[att][0]._model_class(
                                    **x.marshall_dict())
                                    for x in getattr(self, att)])
                    else:
                        setattr(self._db, att, getattr(self, att))
                else:
                    if issubclass(self._attrs[att], datetime.datetime) and \
                            getattr(self, att) is not None:
                        # datetime in cqlengine are 'naive', ours are 'aware'
                        setattr(self._db, att,
                                getattr(self, att).replace(tzinfo=None))
                    else:
                        self_att = self._attrs[att]
                        get_att = getattr(self, att)
                        if issubclass(self_att, CaliopenObject):
                            if get_att is not None:
                                setattr(self._db, att, self_att._model_class(
                                    **get_att.marshall_dict()))
                        else:
                            setattr(self._db, att, get_att)

    def unmarshall_db(self, **options):
        """squash self.attrs with db representation"""

        if isinstance(self._db, self._model_class):
            self.unmarshall_dict(dict(self._db))
        else:
            log.warn('Invalid model class, expect {}, have {}'.
                     format(self._db.__class__, self._model_class.__class__))

    def set_uuid(self):
        setattr(self, self._model_class._pkey, uuid.uuid4())


class ObjectUser(ObjectStorable):
    """Objects that MUST belong to a user to survive in Caliopen's world..."""

    def __init__(self, user=None, **params):
        self.user = user
        self.user_id = user.user_id
        super(ObjectUser, self).__init__(**params)

    def marshall_dict(self, **options):
        """output a dict representation of self 'public' attributes"""

        self_dict = {}
        for att, val in vars(self).items():
            if not att.startswith("_") and val is not None and att != 'user':
                if isinstance(self._attrs[att], types.ListType):
                    lst = []
                    if len(att) > 0:
                        if issubclass(self._attrs[att][0], ObjectDictifiable):
                            for item in val:
                                lst.append(item.marshall_dict())
                        else:
                            lst = val
                        self_dict[att] = lst
                    else:
                        self_dict[att] = lst
                elif issubclass(self._attrs[att], ObjectDictifiable):
                    self_dict[att] = val.marshall_dict()
                else:
                    self_dict[att] = val

        return self_dict

    @classmethod
    def list_db(cls, user):
        """List all objects that belong to an user."""
        models = cls._model_class.filter(user_id=user.user_id)
        objects = []
        for model in models:
            obj = cls(user)
            obj._db = model
            obj.unmarshall_db()
            objects.append(obj)
        return objects

    def get_db(self, **options):
        """Get an object belonging to an user and put it in self._db attrs"""
        if self._pkey_name:
            param = {
                self._pkey_name: getattr(self, self._pkey_name)
            }
        else:
            param = {}

        try:
            self._db = self._model_class.get(user_id=self.user_id, **param)
        except NotFound:
            raise NotFound('%s %s not found for user %s' %
                           (self.__class__.__name__,
                            param[self._pkey_name], self.user_id))

    def apply_patch(self, patch, **options):
        """
        Update self attributes with patch rfc7396 and Caliopen's specifications
        if, and only if, patch is consistent with current obj db instance

        :param patch: json-dict object describing the patch to apply
                with a "current_state" key. see caliopen rfc for explanation
        :param options: whether patch should be propagated to db and/or index
        :return: Exception or None
        """
        if patch is None or "current_state" not in patch:
            raise main_errors.PatchUnprocessable()

        patch_current = patch.pop("current_state")

        # build 3 siblings : 2 from patch and last one from db
        obj_patch_new = self.__class__(user_id=self.user_id)
        obj_patch_old = self.__class__(user_id=self.user_id)
        try:
            obj_patch_new.unmarshall_json_dict(patch)
        except Exception as exc:
            log.info(exc)
            raise main_errors.PatchUnprocessable(message= \
                "unable to unmarshall patch into object <{}>".format(
                    exc))
        try:
            obj_patch_old.unmarshall_json_dict(patch_current)
        except Exception as exc:
            log.info(exc)
            raise main_errors.PatchUnprocessable(message= \
                "unable to unmarshall patch into object <{}>".format(
                    exc))
        self.get_db()

        # TODO : manage protected attributes, to prevent patch on them
        if "tags" in patch.keys():
            raise main_errors.ForbiddenAction(
                message="patching tags through parent object is forbidden")

        # check if patch is consistent with db current state
        # if it is, squash self attributes
        self.unmarshall_db()

        for key in patch.keys():
            current_attr = self._attrs[key]
            try:
                self._check_key_consistency(current_attr, key,
                                            obj_patch_old,
                                            obj_patch_new)
            except Exception as exc:
                log.info("key consistency checking failed: {}".format(exc))
                raise exc

            # all controls passed, we can actually set the new attribute
            create_sub_object = False
            if key not in patch_current.keys():
                create_sub_object = True
            else:
                if patch_current[key] in (None, [], {}):
                    create_sub_object = True
                if isinstance(patch_current[key], list) and len(
                        patch[key]) > len(patch_current[key]):
                    create_sub_object = True

            if patch[key] is not None:
                unmarshall_item(patch, key, self, self._attrs[key],
                                create_sub_object)

        if "db" in options and options["db"] is True:
            # apply changes to db model and update db
            if "with_validation" in options and options[
                "with_validation"] is True:
                d = self.marshall_dict()
                try:
                    self._json_model(d).validate()
                except Exception as exc:
                    log.info("document is not valid: {}".format(exc))
                    raise main_errors.PatchUnprocessable(
                        message="document is not valid,"
                                " can't insert it into db: <{}>".format(exc))

            self.marshall_db()
            try:
                self.update_db()
            except Exception as exc:
                log.info(exc)
                raise main_errors.PatchError(message="Error when updating db")

    def _check_key_consistency(self, current_attr, key, obj_patch_old,
                               patch_current):
        """
        check if a key provided in patch is consistent with current state

        """

        if key not in self._attrs.keys():
            raise main_errors.PatchUnprocessable(
                message="unknown key in patch")
        old_val = getattr(obj_patch_old, key)
        cur_val = getattr(self, key)
        msg = "Patch current_state not consistent with db, step {} key {}"

        if isinstance(current_attr, types.ListType):
            if not isinstance(cur_val, types.ListType):
                raise main_errors.PatchConflict(
                    messag=msg.format(0, key))

        if key not in patch_current.keys():
            # means patch wants to add the key.
            # Value in db should be null or empty
            if cur_val not in (None, [], {}):
                raise main_errors.PatchConflict(
                    message=msg.format(0.5, key))
        else:
            if isinstance(current_attr, types.ListType):
                if old_val == [] and cur_val != []:
                    raise main_errors.PatchConflict(
                        message=msg.format(1, key))
                if cur_val == [] and old_val != []:
                    raise main_errors.PatchConflict(
                        message=msg.format(2, key))
                for old in old_val:
                    for elem in cur_val:
                        if issubclass(current_attr[0], CaliopenObject):
                            if elem.__dict__ == old.__dict__:
                                break
                        else:
                            if elem == old:
                                break
                    else:
                        raise main_errors.PatchConflict(
                            message=msg.format(3, key))
            elif issubclass(self._attrs[key], types.DictType):
                if cmp(old_val, cur_val) != 0:
                    raise main_errors.PatchConflict(
                        message=msg.format(4, key))
            else:
                # XXX ugly patch but else compare 2 distinct objects
                # and not their representation
                if hasattr(old_val, 'marshall_dict') and \
                        hasattr(cur_val, 'marshall_dict'):
                    old_val = old_val.marshall_dict()
                    cur_val = cur_val.marshall_dict()
                if old_val != cur_val:
                    raise main_errors.PatchConflict(
                        message=msg.format(5, key))


class ObjectIndexable(ObjectUser):
    zope.interface.implements(storage.IndexIO)

    _index_class = None  # dsl model for object
    _index = None  # dsl model instance

    def get_index(self, **options):
        """Get a doc from ES within user's index and put it at self._index"""

        obj_id = getattr(self, self._pkey_name)
        try:
            self._index = self._index_class.get(index=self.user.shard_id,
                                                id=obj_id,
                                                using=self._index_class.client())
        except Exception as exc:
            if isinstance(exc, ESexceptions.NotFoundError):
                log.info("indexed doc not found")
                self._index = None
                raise NotFound('%s #%s not found for user %s' %
                               (self.__class__.__name__, obj_id, self.user_id))
            else:
                raise exc

    def save_index(self, wait_for=False, **options):
        if wait_for:
            self._index.save(using=self._index_class.client(),
                             refresh="wait_for")
        else:
            self._index.save(using=self._index_class.client())

    def create_index(self, **options):
        """Create indexed document from current self._index state"""

        self.marshall_index()
        self.save_index()

    def delete_index(self, **options):
        try:
            self._index.delete(using=self._index_class.client(),
                               refresh="wait_for")
        except Exception as exc:
            log.info(exc)
            return exc

        return None

    def update_index(self, wait_for=False, **options):
        """get indexed doc from elastic and update it with self attrs

        if indexed doc doesn't exist, create it
        else update changed fields only
        """
        self.get_index()
        if self._index is not None:
            try:
                update_dict = self.marshall_index(update=True)
                if wait_for:
                    self._index.update(using=self._index_class.client(),
                                       refresh="wait_for",
                                       **update_dict)
                else:
                    self._index.update(using=self._index_class.client(),
                                       **update_dict)
            except Exception as exc:
                log.info("update index failed: {}".format(exc))

        else:
            # for some reasons, index doc not found... create one from scratch
            self.create_index()

    def marshall_index(self, **options):
        """squash self._index with self 'public' attributes

        options:
            update=True : only changed values will be replace in self._index
                          and a dict with changed applied will be returned
        """

        # TODO : manage protected attrs (ie attributes that user should not be able to change directly)

        update = False

        if "update" in options and options["update"] is True:
            update = True
        # index_sibling is instanciated with self._index values to perform
        # object comparaison
        index_sibling = self.__class__(user=self.user)
        index_sibling._index = self._index

        index_sibling.unmarshall_index()
        if not isinstance(self._index, self._index_class):
            self._index = self._index_class()
            self._index.meta.index = self.user.shard_id
            self._index.meta.using = self._index.client()
            self._index.meta.id = getattr(self, self._pkey_name)

        # update_sibling is an empty sibling that will be filled
        # with attributes from self
        update_sibling = self.__class__(user=self.user)

        m = self._index._doc_type.mapping.to_dict()
        for att in m[self._index._doc_type.name]["properties"]:
            if not att.startswith("_") and att in index_sibling.keys():
                if update:
                    if getattr(self, att) != getattr(index_sibling, att):
                        setattr(update_sibling, att, getattr(self, att))
                else:
                    setattr(update_sibling, att, getattr(self, att))

        update_dict = update_sibling.marshall_dict()

        for k, v in update_dict.iteritems():
            if k in self._index_class.__dict__:
                # do not try to set a property directly
                if not isinstance(getattr(self._index_class, k), property):
                    setattr(self._index, k, v)
            else:
                setattr(self._index, k, v)

        if update:
            delattr(update_sibling, "user_id")
            return update_sibling.marshall_dict()

    def unmarshall_index(self, **options):
        """squash self.attrs with index representation"""
        if isinstance(self._index, self._index_class):
            self.unmarshall_dict(self._index.to_dict())

    def apply_patch(self, patch, **options):
        try:
            super(ObjectIndexable, self).apply_patch(patch, **options)
        except Exception as exc:
            log.info("ObjectIndexable apply_patch() returned error: {}".format(
                exc))
            raise exc

        if "index" in options and options["index"] is True:
            # silently update index. Should we raise an error if it fails ?
            try:
                self.update_index(wait_for=True)
            except Exception as exc:
                log.info("apply_patch update_index() exception: {}".
                         format(exc))
                raise exc


def unmarshall_item(document, key, target_object, target_attr_type,
                    is_creation):
    """
    general function to cast a dict item (ie: document[key])
    into the corresponding target_object's attr (ie: target_object.key)

    :param document: source dict
    :param key: source dict key to unmarshall
    :param target_object: object to unmarshall document[key] into
    :param target_attr_type: the types.type of corresponding attr in target obj.
    :param is_creation: if true, we are in the context of the creation of an obj
    :return: nothing, target object is modified in-place
    """

    if isinstance(target_attr_type, list):
        lst = []
        if issubclass(target_attr_type[0], ObjectDictifiable):
            for item in document[key]:
                sub_obj = target_attr_type[0]()
                sub_obj.unmarshall_dict(item)
                if is_creation and isinstance(sub_obj, ObjectStorable):
                    sub_obj.set_uuid()
                lst.append(sub_obj)
        elif issubclass(target_attr_type[0], uuid.UUID):
            for item in document[key]:
                sub_obj = uuid.UUID(str(item))
                lst.append(sub_obj)
        else:
            lst = document[key]
        setattr(target_object, key, lst)

    elif issubclass(target_attr_type, ObjectDictifiable):
        if hasattr(target_object, 'user'):
            opts = {'user': target_object.user}
        else:
            opts = {}
        sub_obj = target_attr_type(**opts)
        sub_obj.unmarshall_dict(document[key])
        setattr(target_object, key, sub_obj)

    elif issubclass(target_attr_type, uuid.UUID):
        setattr(target_object, key, uuid.UUID(str(document[key])))

    elif issubclass(target_attr_type, datetime.datetime):
        if document[key] is not None \
                and document[key].tzinfo is None:
            setattr(target_object, key, document[key].replace(tzinfo=
                                                              pytz.utc))
        else:
            setattr(target_object, key, document[key])
    else:
        new_attr = document[key]
        if hasattr(target_attr_type, "validate"):
            new_attr = target_attr_type().validate(document[key])
        setattr(target_object, key, new_attr)
