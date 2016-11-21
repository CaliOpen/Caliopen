const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const baseConfig = require('./config.js');

let config = Object.assign(baseConfig.getBase('cordova'), {
  entry: [path.join(__dirname, '../src/index.js')],
  output: {
    path: path.join(__dirname, '..', 'cordova', 'www'),
    filename: 'bundle.js',
  },
});

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
