# -*- coding: utf-8 -*-
"""Caliop core mixin classes."""
from __future__ import absolute_import, print_function, unicode_literals
import logging
import uuid

from ..exception import NotFound

log = logging.getLogger(__name__)


class MixinCoreRelation(object):
    """Mixin to manage relations on core object."""

    def _expand_relation(self, reltype):
        """Return collection for given relation."""
        res = self._relations[reltype].find(self.user, self)
        return res['data'] if res else []

    def _get_relation(self, reltype, id):
        """Get a specific core by in in relation."""
        rel_pkey = self._relations[reltype]._pkey_name
        result = self._relations[reltype].find(self.user,
                                               self,
                                               {rel_pkey: id})
        return result['data'][0] if result and result['data'] else None

    def _add_relation(self, reltype, param):
        """Add a new core to given relation."""
        param.validate()
        if hasattr(param, 'is_primary') and param.is_primary:
            existing = self._expand_relation(reltype)
            for obj in existing:
                if obj.is_primary:
                    obj.is_primary = False
                    obj.save()
                    # XXX don't forget to update index

        # Transform param into core object
        # XXX find a better method ?
        attrs = {k: v for k, v in param.to_primitive().items()
                 if v is not None}
        new_obj = self._relations[reltype].create(self.user,
                                                  self,
                                                  **attrs)
        rel_list = getattr(self, reltype)
        rel_list.append(new_obj.get_id())
        self.save()
        if self._index_class:
            self._add_relation_index(reltype, attrs)
        if hasattr(self, '_lookup_objects') and \
           reltype in self._lookup_objects:
            lookupkls = self._lookup_class
            look = lookupkls.create(user_id=self.user.user_id,
                                    value=new_obj.get_id(),
                                    contact_id=self.contact_id,
                                    type=reltype,
                                    lookup_id=new_obj.get_id())
            log.debug('Created lookup object for relation %s:%r' %
                      (reltype, look))

        return new_obj

    def _delete_relation(self, reltype, id):
        """Delete core from relation."""
        rel_list = getattr(self, reltype)
        if id in rel_list:
            rel_list.remove(id)
        self.save()
        related = self._get_relation(reltype, id)
        if self._index_class and related:
            pkey = related._pkey_name
            self._delete_relation_index(reltype, pkey, id)
        if related:
            related.model.delete()
        else:
            raise NotFound
        if hasattr(self, '_lookup_objects') and \
           reltype in self._lookup_objects:
            lookupkls = self._lookup_class
            lookup = lookupkls.get(self.user, id)
            if lookup:
                lookup.delete()
            else:
                log.warn('Lookup object not found when deleting relation')
        return True

    def _add_relation_index(self, reltype, attrs):
        """Add a relation to indexed object."""
        idx = self._index_class.get(self.user_id, self.get_id())
        nested = getattr(idx, reltype)
        if not nested:
            log.warn('Nested index {} not found for {}'.format(reltype, self))
            return False
        nested.append(attrs)
        return True

    def _delete_relation_index(self, reltype, key, id):
        """Delete a relation from an indexed object."""
        idx = self._index_class.get(self.user_id, self.get_id())
        # Look for existing entry
        found = None
        nested = getattr(idx, reltype)
        if not nested:
            log.warn('Nested index {} not found for {}'.format(reltype, self))
            return False
        for child in nested:
            if getattr(child, key) == id:
                found = child
        if not found:
            log.warn('Relation %s %s with id %s not found in index' %
                     (reltype, key, id))
        nested.remove(found)
        return True


class MixinCoreNested(object):
    """Mixin class for core nested objects management."""

    def _add_nested(self, column, nested):
        """Add a nested object to a list."""
        nested.validate()
        kls = self._nested.get(column)
        if not kls:
            raise Exception('No nested class for {}'.format(column))
        column = getattr(self.model, column)
        # Ensure unicity
        if hasattr(kls, 'uniq_name'):
            for value in column:
                uniq = getattr(value, kls.uniq_name)
                if uniq == getattr(nested, kls.uniq_name):
                    raise Exception('Unicity conflict for {}'.format(uniq))
        if hasattr(nested, 'is_primary') and nested.is_primary:
            for old_primary in column:
                column.is_primary = False
        value = nested.to_primitive()
        pkey = getattr(kls, '_pkey')
        value[pkey] = uuid.uuid4()
        log.debug('Will insert nested {} : {}'.format(column, value))
        column.append(kls(**value))
        return value

    def _delete_nested(self, column, nested_id):
        """Delete a nested object with its id from a list."""
        attr = getattr(self, column)
        log.debug('Will delete {} with id {}'.format(column, nested_id))
        found = -1
        for pos in range(0, len(attr)):
            nested = attr[pos]
            current_id = str(getattr(nested, nested._pkey))
            if current_id == nested_id:
                found = pos
        if found == -1:
            log.warn('Nested object {}#{} not found for deletion'.
                     format(column, nested_id))
            return None
        return attr.pop(found)

    @classmethod
    def create_nested(cls, values, kls):
        """Create nested objects in store format."""
        nested = []
        for param in values:
            param.validate()
            attrs = param.to_primitive()
            if hasattr(kls, '_pkey'):
                # XXX default value not correctly handled
                attrs[getattr(kls, '_pkey')] = uuid.uuid4()
            nested.append(kls(**attrs))
        return nested
