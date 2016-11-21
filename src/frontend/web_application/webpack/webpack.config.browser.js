const path = require('path');
const webpack = require('webpack');
const baseConfig = require('./config.js');

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

const config = Object.assign(baseConfig.getBase('web'), {
  entry: [
    'script-loader!jquery',
    'script-loader!foundation-sites',
    path.join(__dirname, '../src/index.jsx'),
  ],
  output: {
    path: path.join(__dirname, '..', 'dist/browser/'),
    filename: 'bundle.js',
    publicPath: '/',
  },
});

if (isDev) {
  config.entry.unshift(
    'react-hot-loader/patch',
    'webpack-hot-middleware/client',
    'webpack/hot/only-dev-server'
  );

  config.output.publicPath = '/build/';

  config.plugins.push(
    new webpack.HotModuleReplacementPlugin()
  );
}

let uglifyJSOptions = {};

if (!isProd) {
  uglifyJSOptions = {
    beautify: true,
    mangle: false,
    compress: {
      warnings: false,
    },
  };
}

config.plugins.push(new webpack.optimize.UglifyJsPlugin(uglifyJSOptions));


module.exports = config;
