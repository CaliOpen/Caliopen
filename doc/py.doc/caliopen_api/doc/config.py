# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals


def includeme(config):
    """Configure API to serve static documentation files"""

    # the raw documentation is within folder /doc/api
    config.add_static_view('doc/api', 'caliopen_api_doc:../../api/', cache_max_age=3600)
    # the api swagger-ui is within folder /devtools/swagger-ui
    config.add_static_view('api-ui', 'caliopen_api_doc:../../../devtools/swagger-ui/', cache_max_age=3600)
