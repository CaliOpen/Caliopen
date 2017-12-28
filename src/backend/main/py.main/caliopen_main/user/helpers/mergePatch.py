# -*- coding: utf-8 -*-
"""
Functions to handle patch dict arriving from clients
to update client's resources
"""

import logging
log = logging.getLogger(__name__)


def merge_patch(target, patch):
    """rfc 7396 merge patch implementation"""
    if type(patch) is dict:
        if type(target) is not dict:
            target = {}  # Ignore the contents and set it to an empty Object
        for key, value in patch.items():
            if value is None:
                if key in target:
                    del target[key]
            else:
                target[key] = merge_patch(target[key], value)
        return target
    else:
        return patch


class MergeBatch(object):

    """Describe a batch of operations for processing a merge."""

    def __init__(self, core):
        self.obj = core
        self.operations = []

    def add_operation(self, type, column, value):
        self.operations.append((type, column, value))

    def process(self):
        """Process the merge on core object."""
        log.info("process operations : {}".format(self.operations))
        for typ, column, value in self.operations:
            core_attr = getattr(self.obj, column)
            if typ == 'add':
                core_attr = core_attr + value
            elif typ == 'del':
                core_attr = core_attr - value
            elif typ == 'replace':
                core_attr = value
            else:
                raise NotImplementedError('Merge operation {} not supported',
                                          format(typ))
        self.obj.save()
