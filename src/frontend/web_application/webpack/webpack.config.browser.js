const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const baseConfig = require('./config.js');

const PUBLIC_PATH = '/assets/';
const isTest = process.env.NODE_ENV === 'test';
const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

let config = Object.assign(baseConfig.getBase('browser'), {
  devtool: 'source-map',
  entry: {
    app: [
      path.join(__dirname, '../src/index.jsx'),
    ],
    vendor: [
      'babel-polyfill',
      'script-loader!jquery',
      'script-loader!foundation-sites',
    ],
  },
  output: {
    path: path.join(__dirname, '..', 'dist/server/public/assets'),
    filename: '[name].[chunkhash].js',
    publicPath: PUBLIC_PATH,
  },
});

if (isDev) {
  config = Object.assign(config, {
    devServer: {
      contentBase: false,
      hot: false,
      inline: false,
      port: '8080',
      proxy: {
        '/': {
          target: 'http://localhost:4001',
        },
      },
      watchOptions: {
        aggregateTimeout: 300,
        poll: 1000,
      },
    },
  });
}

config = baseConfig.configureStylesheet(config, 'client.css');
config = baseConfig.configureAssets(config);
config = baseConfig.configureVendorSplit(config);
config = baseConfig.configureHTMLTemplate(config);

module.exports = config;
