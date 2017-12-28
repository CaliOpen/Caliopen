# -*- coding: utf-8 -*-
"""Caliopen contact parameters classes."""
from __future__ import absolute_import, print_function, unicode_literals

import logging
import uuid
import phonenumbers

from caliopen_main.common.objects.base import ObjectIndexable

from ..store.contact import Phone as ModelPhone
from ..store.contact_index import IndexedPhone
from ..returns import PhoneParam


log = logging.getLogger(__name__)


class Phone(ObjectIndexable):
    """Phone number related to contact."""

    _attrs = {
        "contact_id": uuid.UUID,
        "is_primary": bool,
        "number": str,
        "normalized_number": str,
        "phone_id": uuid.UUID,
        "type": str,
        "uri": str,
        "user_id": uuid.UUID
    }

    _model_class = ModelPhone
    _json_model = PhoneParam
    _index_class = IndexedPhone

    def normalize_number(self, number):
        """Try to normalize a phone number."""
        try:
            normalized = phonenumbers.parse(number, None)
            phone_format = phonenumbers.PhoneNumberFormat.INTERNATIONAL
            return phonenumbers.format_number(normalized, phone_format)
        except Exception as exc:
            log.warn('Unable to normalize phone number {0} : {1}'.
                     format(number, exc))

    def unmarshall_dict(self, document, **options):
        """Try to extract a normalized phone number from document"""
        super(Phone, self).unmarshall_dict(document, **options)
        normalized = self.normalize_number(self.number)
        if normalized:
            setattr(self, 'normalized_number', normalized)
