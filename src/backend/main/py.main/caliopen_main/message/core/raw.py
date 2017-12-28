# -*- coding: utf-8 -*-
"""Caliopen core raw message class."""
from __future__ import absolute_import, print_function, unicode_literals

import six
import uuid
import logging

from minio import Minio
from minio.error import ResponseError

if six.PY3:
    from urllib.parse import urlparse
else:
    import urlparse

from minio import Minio
from minio.error import ResponseError

from caliopen_storage.core import BaseUserCore, BaseCore
from caliopen_storage.exception import NotFound
from caliopen_storage.config import Configuration

from ..store import (RawMessage as ModelRaw,
                     UserRawLookup as ModelUserRawLookup)
from caliopen_main.message.parsers.mail import MailMessage

log = logging.getLogger(__name__)


class RawMessage(BaseCore):
    """
    Raw message core.

    Store in binary form any message before processing
    """

    _model_class = ModelRaw
    _pkey_name = 'raw_msg_id'

    @classmethod
    def create(cls, raw):
        """Create raw message."""
        key = uuid.uuid4()
        size = len(raw)
        return super(RawMessage, cls).create(raw_msg_id=key,
                                             raw_data=raw,
                                             raw_size=size)

    @classmethod
    def get(cls, raw_msg_id):
        """
        Get raw message from db or ObjectStorage service

        :param raw_msg_id:
        :return: a RawMessage or NotFound exception
        """
        try:
            raw_msg = super(RawMessage, cls).get(raw_msg_id)
        except Exception as exc:
            log.warn(exc)
            raise NotFound

        if raw_msg.raw_data == "" and raw_msg.uri != "":
            # means raw message data have been stored in object store
            # need to retrieve raw_data from it
            url = urlparse.urlsplit(raw_msg.uri)
            path = url.path.strip("/")
            if url.scheme == 's3':
                minioConf = Configuration("global").get("object_store")
                minioClient = Minio(minioConf["endpoint"],
                                    access_key=minioConf["access_key"],
                                    secret_key=minioConf["secret_key"],
                                    secure=False,
                                    region=minioConf["location"])
                try:
                    resp = minioClient.get_object(url.netloc, path)
                except Exception as exc:
                    log.warn(exc)
                    raise NotFound
                # resp is a urllib3.response.HTTPResponse class
                try:
                    raw_msg.raw_data = resp.data
                except Exception as exc:
                    log.warn(exc)
                    raise NotFound
            else:
                log.warn("raw message uri scheme not implemented")
                raise NotFound

        return raw_msg

    @classmethod
    def get(cls, raw_msg_id):
        """
        Get raw message from db or ObjectStorage service

        :param raw_msg_id:
        :return: a RawMessage or NotFound exception
        """
        try:
            raw_msg = super(RawMessage, cls).get(raw_msg_id)
        except NotFound:
            return NotFound

        if raw_msg.raw_data == "" and raw_msg.uri != "":
            # means raw message data have been stored in object store
            # need to retrieve raw_data from it
            minioConf = Configuration("global").get("object_store")
            minioClient = Minio(minioConf["endpoint"],
                                access_key=minioConf["access_key"],
                                secret_key=minioConf["secret_key"],
                                secure=False,
                                region=minioConf["location"])
            try:
                resp = minioClient.get_object(
                    minioConf["buckets"]["raw_messages"],
                    raw_msg_id)
            except ResponseError as exc:
                log.warn(exc)
                return NotFound
            # resp is a urllib3.response.HTTPResponse class
            try:
                raw_msg.raw_data = resp.data
            except Exception as exc:
                log.warn(exc)
                return NotFound

        return raw_msg

    @classmethod
    def get_for_user(cls, user_id, raw_msg_id):
        """
        Get raw message by raw_msg_id, if message belongs to user.

        :param: user_id is a string
        :param: raw_msg_id is a string
        :return: a RawMessage or None
        """
        if not UserRawLookup.belongs_to_user(user_id, raw_msg_id):
            return None
        try:
            return cls.get(raw_msg_id)
        except NotFound:
            return None

    def parse(self):
        """Parse raw message to get a formatted object."""
        return MailMessage(self)


class UserRawLookup(BaseUserCore):
    """User raw message affectation."""

    _model_class = ModelUserRawLookup
    _pkey_name = 'raw_msg_id'
