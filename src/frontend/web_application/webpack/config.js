const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const { CommonsChunkPlugin } = require('webpack').optimize;
// const StyleLintPlugin = require('stylelint-webpack-plugin');

const initialConfig = {
  entry: {
    app: [],
    vendor: [],
  },
  output: {},
  plugins: [],
  module: {
    rules: [],
  },
};

const configureStylesheet = (config, filename = 'client_[name]', relativePath = '') => {
  const extractTextPlugin = new ExtractTextPlugin({
    filename: relativePath + filename,
    allChunks: true,
  });
  const cfg = Object.assign({}, config);
  cfg.plugins.push(
    extractTextPlugin,
    new OptimizeCssAssetsPlugin({
      canPrint: false,
    })
    // new StyleLintPlugin()
  );
  cfg.module.rules.push(
    {
      test: /\.css$/,
      loader: extractTextPlugin.extract({
        fallback: 'style-loader',
        use: [{ loader: 'css-loader', options: { sourceMap: true } }],
      }),
    },
    {
      test: /\.scss$/,
      loader: extractTextPlugin.extract({
        fallback: 'style-loader',
        use: [
          { loader: 'css-loader', options: { sourceMap: true } },
          { loader: 'postcss-loader', options: { sourceMap: true } },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: false,
              includePaths: [
                path.resolve(__dirname, '../src'),
                path.resolve(__dirname, '../node_modules/foundation-sites/scss'),
                path.resolve(__dirname, '../node_modules/font-awesome/scss'),
                path.resolve(__dirname, '../node_modules/react-redux-notify/src'),
              ],
            },
          },
        ],
      }),
    }
  );

  return cfg;
};

const configureAssets = (config, outputPath = 'assets/') => {
  config.module.rules.push(
    {
      test: /\.(jpe?g|png|gif)$/i,
      use: [
        {
          loader: 'file-loader',
          options: { hash: 'sha512', digest: 'hex', name: '[name].[ext]', outputPath },
        },
        {
          loader: 'image-webpack-loader',
          options: { bypassOnDebug: true, optimizationLevel: 7, interlaced: false },
        },
      ],
    },
    { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader', options: { mimetype: 'image/svg+xml', name: '[name].[ext]', outputPath } },
    { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader', options: { mimetype: 'application/font-woff', name: '[name].[ext]', outputPath } },
    { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader', options: { mimetype: 'application/font-woff', name: '[name].[ext]', outputPath } },
    { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader', options: { mimetype: 'application/octet-stream', name: '[name].[ext]', outputPath } },
    { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader', options: { name: '[name].[ext]', outputPath } }
  );

  return config;
};

const configureVendorSplit = (config) => {
  config.entry.vendor.push(
    '@gandi/react-translate',
    'async-validator',
    'axios',
    'classnames',
    'history',
    'lodash.debounce',
    'lodash.isequal',
    'lodash.throttle',
    'moment-timezone',
    'prop-types',
    'rc-slider',
    'react',
    'react-country-region-selector',
    'react-datepicker',
    'react-dom',
    'react-modal',
    'react-moment',
    'react-redux',
    'react-redux-notify',
    'react-router-dom',
    'react-router-redux',
    'react-tappable',
    'redux',
    'redux-axios-middleware',
    'redux-form',
    'reselect',
    'uuid',
    'xregexp'
  );
  config.plugins.push(new CommonsChunkPlugin({
    names: ['vendor', 'manifest'],
  }));

  return config;
};

const configureHTMLTemplate = (config) => {
  config.plugins.push(
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, '../dist/server/template.html'),
      template: path.resolve(__dirname, '../template/index.ejs'),
      alwaysWriteToDisk: true,
    }),
    new HtmlWebpackHarddiskPlugin()
);

  return config;
};

module.exports = {
  configureStylesheet,
  configureAssets,
  configureVendorSplit,
  configureHTMLTemplate,
  getBase: (buildTarget) => {
    const plugins = [
      new webpack.DefinePlugin({
        BUILD_TARGET: JSON.stringify(buildTarget),
        HAS_SSR: process.env.HAS_SSR || true,
        CALIOPEN_ENV: JSON.stringify(process.env.NODE_ENV),
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }),
    ];

    return Object.assign(initialConfig, {
      plugins,
      module: Object.assign(initialConfig.module, {
        rules: [
          {
            test: /\.jsx?$/,
            include: path.join(__dirname, '../src/'),
            exclude: /node_modules/,
            use: ['babel-loader', 'eslint-loader'],
          },
        ],
      }),
      resolve: {
        extensions: ['.js', '.jsx'],
      },
    });
  },
};
