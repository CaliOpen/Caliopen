#!/bin/bash
CALIOPEN_BASE_DIR="/opt/caliopen"
CALIOPEN_BACKEND_DIR="${CALIOPEN_BASE_DIR}/code/src/backend"
CONF_FILE="${CALIOPEN_BACKEND_DIR}/configs/caliopen.yaml.template"

CASSANDRA_VERSION="2.2.8"

# Install system packages
apt-get -y update
apt-get -y upgrade
apt-get install -y git libffi-dev python-pip gcc python-dev libssl-dev libev4 libev-dev redis-server elasticsearch

# Debian jessie setuptools is a really old version (5.1.x)
# Install a really fresh version of setuptools
wget -q https://bootstrap.pypa.io/ez_setup.py
python ez_setup.py

# Some package must be installed using pip and upgraded to latest
pip install --upgrade pip
pip install --upgrade pyasn1


# Create CaliOpen work directory
[[ -d ${CALIOPEN_BASE_DIR}} ]] || mkdir ${CALIOPEN_BASE_DIR}

# Install storage engines
[[ -d "${CALIOPEN_BASE_DIR}}/ext" ]] || mkdir ${CALIOPEN_BASE_DIR}/ext

cd ${CALIOPEN_BASE_DIR}/ext
wget -q http://www-eu.apache.org/dist/cassandra/${CASSANDRA_VERSION}/apache-cassandra-${CASSANDRA_VERSION}-bin.tar.gz
tar xzf apache-cassandra-${CASSANDRA_VERSION}-bin.tar.gz

# Install python packages
cd ${CALIOPEN_BACKEND_DIR}/main/py.storage
python setup.py develop
cd ${CALIOPEN_BACKEND_DIR}/main/py.main
python setup.py develop

# API
cd ${CALIOPEN_BACKEND_DIR}/interfaces/REST/py.server
python setup.py develop

# SMTP
cd ${CALIOPEN_BACKEND_DIR}/protocols/py.smtp
pip install -r requirements.txt
python setup.py develop

cd ${CALIOPEN_BACKEND_DIR}/tools/py.CLI
python setup.py develop

# Start store services
cd ${CALIOPEN_BASE_DIR}/ext/apache-cassandra-${CASSANDRA_VERSION}
sed -i -e '/#MAX_HEAP_SIZE=/ s/.*/MAX_HEAP_SIZE="1G"/' conf/cassandra-env.sh
sed -i -e '/#HEAP_NEWSIZE=/ s/.*/HEAP_NEWSIZE="512M"/' conf/cassandra-env.sh
./bin/cassandra

sed -i -e '/#START_DAEMON=true/ s/.*/START_DAEMON=true/' /etc/default/elasticsearch
/etc/init.d/elasticsearch stop
/etc/init.d/elasticsearch start

# Wait for storage up (cassandra)
sleep 10

# Setup caliopen
export CQLENG_ALLOW_SCHEMA_MANAGEMENT="true"
caliopen -f ${CONF_FILE} setup
caliopen -f ${CONF_FILE} create_user -e dev -g John -f Dœuf -p 123456
caliopen -f ${CONF_FILE} import -e dev@caliopen.local -f mbox -p ${CALIOPEN_BASE_DIR}/code/devtools/fixtures/mbox/dev@caliopen.local

# start caliopen API
cd ${CALIOPEN_BACKEND_DIR}/interfaces/REST/py.server
pserve --daemon ${CALIOPEN_BACKEND_DIR}/configs/caliopen-api.development.ini --log-file api.log --pid-file ${CALIOPEN_BASE_DIR}/pserve.pid

# Start lmtp service
cd ${CALIOPEN_BACKEND_DIR}/protocols/py.smtp/caliopen_smtp/bin
./lmtpd.py -f ${CONF_FILE}  > lmtp.log 2>&1 &
