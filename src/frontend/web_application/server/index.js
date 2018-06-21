const path = require('path');
const fs = require('fs');
const argv = require('argv');
const http = require('http');
const getApp = require('./app');
const { getConfig, initConfig } = require('./config');
const { version } = require('../package.json');
const logger = require('./logger')();

const { options: { config: configPath } } = argv
  .option([
    {
      name: 'config',
      type: 'path',
      description: 'the file to set Caliopen options. See config/server.default.js for default options. This can be a regular js or a json file, cf. README.md.',
      example: 'server --config=~/caliopen.webserver.json',
    },
  ])
  .version(version)
  .info('Run Caliopen web server')
  .run();

if (configPath) {
  // read user's config file outside of webpack
  const userOpts = JSON.parse(fs.readFileSync(path.join(configPath), 'utf8'));

  initConfig(userOpts);
}

const server = http.createServer(getApp());
const { webServer: { port, hostname } } = getConfig();
const params = [
  port,
  ...(hostname ? [hostname] : []),
  () => {
    const { address, port: runningPort } = server.address();
    logger.info(`Server started: http://${address}:${runningPort}/`);
  },
];

server.listen(...params);
