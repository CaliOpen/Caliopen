import os
import sys
import re

from setuptools import setup, find_packages

PY3 = sys.version_info[0] == 3

name = "caliopen_api"

here = os.path.abspath(os.path.dirname(__file__))
README = open(os.path.join(here, 'README.rst')).read()
CHANGES = open(os.path.join(here, 'CHANGES.rst')).read()

with open(os.path.join(*([here] + name.split('.') + ['__init__.py']))) as v_file:
    version = re.compile(r".*__version__ = '(.*?)'", re.S).match(v_file.read()).group(1)

requires = [
    'pyramid >=1.5, <=1.5.99',
    'pyramid_jinja2',
    'caliopen_storage',
    'caliopen_main',
    'pyramid_kvs',
    'waitress',
    'cornice==1.2.1',
    'colander',
    'pyramid-swagger',
    'rfc3987',
    'rfc3339',
    ]

tests_require = ['nose', 'coverage']
if sys.version_info < (3, 3):
    tests_require.append('mock')


extras_require = {
    'dev': [
        'pyramid_debugtoolbar',
        'caliopen_api_doc',
    ],
    'doc': [
        'sphinx',
    ],
    'test': tests_require
}

setup(name=name,
      version=version,
      description='Caliopen REST API Server',
      long_description=README + '\n\n' + CHANGES,
      classifiers=[
          "Programming Language :: Python",
          "Framework :: Pyramid",
          "Topic :: Internet :: WWW/HTTP",
          "Topic :: Internet :: WWW/HTTP :: WSGI :: Application",
      ],
      author='Caliopen Contributors',
      author_email='',
      url='https://github.com/Caliopen/caliopen.api',
      license='AGPLv3',
      keywords='web pyramid api rest',
      packages=find_packages(),
      include_package_data=True,
      zip_safe=False,
      install_requires=requires,
      tests_require=tests_require,
      extras_require=extras_require,
      test_suite="caliopen_api.tests",
      entry_points={
          'paste.app_factory': ['main = caliopen_api:main'],
      })
