# -*- coding: utf-8 -*-
"""Caliopen contact parameter validators."""
from __future__ import absolute_import, print_function, unicode_literals

from schematics.types import StringType
from schematics.exceptions import ValidationError
import phonenumbers

from ..helpers.normalize import clean_email_address


class InternetAddressType(StringType):

    """Validate an email or instant messaging address, return normalized."""

    def validate_email(self, value, context=None):
        try:
            clean, email = clean_email_address(value)
        except Exception as exc:
            raise ValidationError(exc.message)
        return clean


class PhoneNumberType(StringType):

    """Validate a phone number and normalize in international format."""

    def validate_phone(self, value, context=None):
        try:
            number = phonenumbers.parse(value, None)
            phone_format = phonenumbers.PhoneNumberFormat.INTERNATIONAL
            return phonenumbers.format_number(number, phone_format)
        except Exception as exc:
            raise ValidationError(exc.message)
