const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const baseConfig = require('./config.js');

const config = Object.assign(baseConfig.getBase('cordova'), {
  entry: [
    'babel-polyfill',
    path.join(__dirname, '../src/index.jsx'),
  ],
  output: {
    path: path.join(__dirname, '..', 'cordova', 'www'),
    filename: 'bundle.js',
  },
});

config.module.loaders.push({ test: /\.json$/, loader: 'json-loader' });

config.plugins.push(
  new InterpolateHtmlPlugin({
    HEAD: '',
    BODY_SCRIPT: '',
    MARKUP: '',
  }),
  // Generates an `index.html` file with the <script> injected.
  new HtmlWebpackPlugin({
    inject: true,
    template: path.join(__dirname, '..', 'template', 'index.cordova.html'),
  })
);

module.exports = config;
