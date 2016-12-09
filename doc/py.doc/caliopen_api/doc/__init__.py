# -*- coding: utf-8 -*-

__version__ = '0.0.2'

try:
    import pkg_resources
    pkg_resources.declare_namespace(__name__)
except ImportError:
    import pkgutil
    __path__ = pkgutil.extend_path(__path__, __name__)


from .config import includeme
