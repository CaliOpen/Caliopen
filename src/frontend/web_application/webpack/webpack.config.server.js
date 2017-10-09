const path = require('path');
const baseConfig = require('./config.js');

const config = Object.assign(baseConfig.getBase('server'), {
  target: 'node',
  entry: ['babel-polyfill', path.join(__dirname, '../server/index.js')],
  output: {
    path: path.join(__dirname, '../dist/server/'),
    filename: 'index.js',
    publicPath: '/',
  },
  externals: [
    (context, request, callback) => {
      if ([
        'body-parser', 'cookie-parser', 'debug', 'express', 'express-http-proxy', 'iron', 'locale',
        'serve-favicon',
      ].some(module => module === request)) {
        return callback(null, `commonjs ${request}`);
      }

      return callback();
    },
  ],
});

config.module.rules.push(
  {
    test: /\.(s?css|jpe?g|png|gif)$/,
    loader: 'null-loader',
  },
  {
    test: /\.jsx?$/,
    include: path.join(__dirname, '../server/'),
    loader: 'babel-loader',
  },
  { test: /\.html$/, loader: 'raw-loader' }
);

module.exports = config;
