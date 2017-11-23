# -*- coding: utf-8 -*-
"""Caliopen contact parameters classes."""
from __future__ import absolute_import, print_function, unicode_literals

import logging
import types
from uuid import UUID
import phonenumbers

from caliopen_main.common.objects.base import ObjectIndexable
from caliopen_main.common.parameters.types import PhoneNumberType
from ..store.contact import Phone as ModelPhone
from ..store.contact_index import IndexedPhone
from ..returns import PhoneParam


log = logging.getLogger(__name__)


class Phone(ObjectIndexable):

    _attrs = {
        "contact_id": UUID,
        "is_primary": types.BooleanType,
        "number": types.StringType,
        "normalized_number": types.StringType,
        "phone_id": UUID,
        "type": types.StringType,
        "uri": types.StringType,
        "user_id": UUID
    }

    _model_class = ModelPhone
    _json_model = PhoneParam
    _index_class = IndexedPhone

    def normalize_number(self, number):
        try:
            normalized = phonenumbers.parse(number, None)
            phone_format = phonenumbers.PhoneNumberFormat.INTERNATIONAL
            return phonenumbers.format_number(normalized, phone_format)
        except Exception as exc:
            log.warn('Unable to normalize phone number {0} : {1}'.
                     format(number, exc))

    def unmarshall_dict(self, document, **options):
        """try to extract a normalize phone number from document"""
        super(Phone, self).unmarshall_dict(document, **options)
        normalized = self.normalize_number(self.number)
        if normalized:
            setattr(self, 'normalized_number', normalized)
