# -*- coding: utf-8 -*-
"""Normalization functions for different values."""
from __future__ import absolute_import, unicode_literals
import logging
from email.utils import parseaddr

log = logging.getLogger(__name__)


def clean_email_address(addr):
    """Clean an email address for user resolve."""
    real_name, email = parseaddr(addr.replace('\r', ''))
    if not email:
        log.error('Invalid email address %s' % addr)
        return ("", "")
    name, domain = email.lower().split('@', 1)
    if '@' in domain:
        log.error("invalid email address %s" % addr)
        return ("", "")
    if '+' in name:
        try:
            name, ext = name.split('+', 1)
        except Exception as exc:
            log.info(exc)
    # unicode everywhere
    return (u'%s@%s' % (name, domain), email)
