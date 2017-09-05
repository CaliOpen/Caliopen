import os
import re

from setuptools import setup, find_packages

here = os.path.abspath(os.path.dirname(__file__))
README = open(os.path.join(here, 'README.rst')).read()
CHANGES = open(os.path.join(here, 'CHANGES.rst')).read()

name = "caliopen_pi"

init_file = os.path.join(*([here] + name.split('.') + ['__init__.py']))
with open(init_file) as v_file:
    version = re.compile(r".*__version__ = '(.*?)'", re.S). \
        match(v_file.read()).group(1)

requires = [
    'schematics',
    'pgpy',
    'caliopen_main',
]

extras_require = {
    'dev': [],
    'test': [
        'coverage',
        'docker-py',
        'freezegun',
        'nose'
    ],
}

setup(name=name,
      version=version,
      description='Caliopen pi package. All stuff related to privacy index',
      long_description=README + '\n\n' + CHANGES,
      classifiers=["Programming Language :: Python", ],
      author='Caliopen contributors',
      author_email='contact@caliopen.org',
      url='https://caliopen.org',
      license='AGPLv3',
      packages=find_packages(),
      include_package_data=True,
      zip_safe=False,
      extras_require=extras_require,
      install_requires=requires,
      tests_require=requires,
      )
