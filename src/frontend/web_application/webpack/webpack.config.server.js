const path = require('path');
const baseConfig = require('./config.js');

const isDev = process.env.NODE_ENV === 'development';

const config = Object.assign(baseConfig.getBase('server'), {
  target: 'node',
  entry: [path.join(__dirname, '../server/index.jsx')],
  output: {
    path: path.join(__dirname, '../dist/server/'),
    filename: 'index.js',
  },
});

if (isDev) {
  config.output = {
    path: path.join(__dirname, '../.kotatsu/'),
    filename: 'bundle.js',
  };
}

module.exports = config;
