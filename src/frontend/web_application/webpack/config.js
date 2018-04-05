const path = require('path');
const webpack = require('webpack');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const StyleLintPlugin = require('stylelint-webpack-plugin');
const clientOptions = require('../config/client.default.js');

const configureStylesheet = (filename = 'client_[name]', relativePath = '') => {
  return {
    plugins: [
      new StyleLintPlugin({
        syntax: 'scss',
        emitErrors: false,
      }),
      new OptimizeCssAssetsPlugin({
        canPrint: false,
      }),
      new MiniCssExtractPlugin({
        filename: `${filename}.css`,
        chunkFilename: '[id].css',
      }),
    ],
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            { loader: 'css-loader', options: { sourceMap: true } },
          ],
        },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
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
        },
      ],
    },
  };
};

const configureAssets = (outputPath = 'assets/') => ({
  module: {
    rules: [
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
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader', options: { name: '[name].[ext]', outputPath } },
    ],
  },
});

const configureVendorSplit = () => ({
  entry: {
    vendor: [
      '@gandi/react-translate',
      'async-validator',
      'axios',
      'bn.js',
      'classnames',
      'elliptic',
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
      'xregexp',
    ],
  },
});

const configureHTMLTemplate = () => ({
  plugins: [
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, '../dist/server/template.html'),
      template: path.resolve(__dirname, '../template/index.ejs'),
      alwaysWriteToDisk: true,
    }),
    new HtmlWebpackHarddiskPlugin(),
  ],
});

const configureEnv = (buildTarget) => {
  const defined = Object.assign({
    BUILD_TARGET: JSON.stringify(buildTarget),
    HAS_SSR: process.env.HAS_SSR || true,
    CALIOPEN_ENV: JSON.stringify(process.env.NODE_ENV),
    CALIOPEN_OPTIONS: JSON.stringify(clientOptions),
  });

  return {
    plugins: [
      new webpack.DefinePlugin(defined),
    ],
  };
};

module.exports = {
  configureStylesheet,
  configureAssets,
  configureVendorSplit,
  configureHTMLTemplate,
  configureEnv,
};
