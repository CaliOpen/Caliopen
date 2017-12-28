"""Caliopen mixins related to store."""
from __future__ import absolute_import, print_function, unicode_literals
import logging
import uuid

from cassandra.cqlengine import columns

log = logging.getLogger(__name__)


class IndexedModelMixin(object):
    """Mixin to transform model into indexed documents."""

    def __process_udt(self, column, idx):
        """Process a cassandra UDT column to translate into nested index."""

        def map_udt_attributes(item):
            ret = {}
            for col_name, col_value in item.items():
                if col_value is not None:
                    if isinstance(col_value, (columns.UUID, uuid.UUID)):
                        value = str(col_value)
                    else:
                        value = col_value
                    ret[col_name] = value
            return ret

        attr_udt = getattr(self, column.column_name)
        if isinstance(attr_udt, list):
            udts = []
            for item in attr_udt:
                udts.append(map_udt_attributes(item))
            setattr(idx, column.column_name, udts)
        else:
            if attr_udt:
                setattr(idx, column.column_name, map_udt_attributes(attr_udt))

    def _process_column(self, column, idx):
        """Process a core column and translate into index document."""
        col_name = column.column_name
        col_value = getattr(self, col_name)
        try:
            getattr(idx, col_name)
        except AttributeError:
            log.debug('No such column in index mapping {}'.
                      format(column.column_name))
            return
        if isinstance(column, columns.List):
            is_udt = isinstance(column.sub_types[0], columns.UserDefinedType)
            if is_udt:
                self.__process_udt(column, idx)
            else:
                setattr(idx, col_name, col_value)
        elif isinstance(column, columns.UserDefinedType):
            self.__process_udt(column, idx)
        else:
            setattr(idx, col_name, col_value)

    def create_index(self, **extras):
        """Translate a model object into an indexed document."""
        if not self._index_class:
            return False
        idx = self._index_class()
        idx.meta.index = self.user_id

        for name, desc in self._columns.items():
            if desc.is_primary_key:
                if name != 'user_id':
                    idx.meta.id = getattr(self, name)
            else:
                self._process_column(desc, idx)
        for k, v in extras.items():
            setattr(idx, k, v)
        idx.save(using=idx.client())
        return True

    def update_index(self, object_id, changed_columns):
        """Update an existing index with a list of new values"""

        idx = self._index_class()
        idx.meta.index = self.user_id
        idx.meta.id = object_id

        update_doc = {}
        for name in changed_columns:
            column = self._columns[name]
            self._process_column(column, idx)
            update_doc[name] = getattr(idx, name)

        # serialize index doc keeping empty or None value
        out = {}
        for k, v in idx._d_.items():
            try:
                f = idx._doc_type.mapping[k]
                if f._coerce:
                    v = f.serialize(v)
            except KeyError:
                pass
            out[k] = v

        idx.update(using=idx.client(), **out)

    @classmethod
    def search(cls, user, limit=None, offset=0,
               min_pi=0, max_pi=0, sort=None, **params):
        """Search in index using a dict parameter."""
        search = cls._index_class.search(using=cls._index_class.client(),
                                         index=user.user_id)
        for k, v in params.items():
            term = {k: v}
            search = search.filter('match', **term)
        if limit:
            search = search[offset:offset + limit]
        else:
            log.warn('Pagination not set for search query,'
                     ' using default storage one')
        if sort:
            search = search.sort(sort)
        log.debug('Search is {}'.format(search.to_dict()))
        resp = search.execute()
        log.debug('Search result {}'.format(resp))
        return resp
