# -*- coding: utf-8 -*-

__version__ = '0.0.2'

try:
    import pkg_resources
    pkg_resources.declare_namespace(__name__)
except ImportError:
    import pkgutil
    __path__ = pkgutil.extend_path(__path__, __name__)


import logging
from pyramid.config import Configurator
from caliopen_storage.config import Configuration

log = logging.getLogger(__name__)


def main(global_config, **settings):
    """Caliopen entry point for WSGI application.

    Load Caliopen configuration and setup a WSGI application
    with loaded API services.
    """
    # XXX ugly way to init caliopen configuration before pyramid
    caliopen_config = settings['caliopen.config'].split(':')[1]
    Configuration.load(caliopen_config, 'global')

    settings['pyramid_swagger.exclude_paths'] = [r'^/api-ui/?', r'^/doc/api/?', r'^/defs/?']
    settings['pyramid_swagger.enable_response_validation'] = True
    config = Configurator(settings=settings)
    services = config.registry.settings. \
        get('caliopen_api.services', []). \
        split('\n')
    route_prefix = settings.get('caliopen_api.route_prefix')
    for service in services:
        log.info('Loading %s service' % service)
        config.include(service, route_prefix=route_prefix)
    config.end()
    return config.make_wsgi_app()
