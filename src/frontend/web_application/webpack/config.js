const path = require('path');
const webpack = require('webpack');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const clientOptions = require('../config/client.default.js');

const isDev = process.env.NODE_ENV === 'development';

const configureSrcTsLoader = ({ isNode } = { isNode: false }) => {
  return {
    module: {
      rules: [
        {
          test: /(?<!\.worker)\.(j|t)sx?$/,
          exclude: /node_modules/,
          include: path.join(__dirname, '../src/'),
          loader: 'ts-loader',
        },
        ...(isNode
          ? [
              {
                test: /\.worker\.(t|j)s$/,
                use: [{ loader: 'null-loader' }],
              },
            ]
          : [
              {
                test: /\.worker\.(t|j)s$/,
                exclude: /node_modules/,
                use: [
                  { loader: 'worker-loader' },
                  {
                    loader: 'ts-loader',
                  },
                ],
              },
            ]),
      ],
    },
  };
};

const configureStylesheet = () => {
  return {
    plugins: [
      new OptimizeCssAssetsPlugin({ canPrint: false }),
      new MiniCssExtractPlugin({
        filename: isDev ? 'client.css' : 'client.[hash].css',
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
                sassOptions: {
                  includePaths: [
                    path.resolve(__dirname, '../src'),
                    // XXX: use tilde ~ instead of those includes https://webpack.js.org/loaders/sass-loader/#resolving-import-at-rules
                    path.resolve(
                      __dirname,
                      '../node_modules/foundation-sites/scss'
                    ),
                    path.resolve(
                      __dirname,
                      '../node_modules/react-redux-notify/src'
                    ),
                  ],
                },
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
            options: {
              hash: 'sha512',
              digest: 'hex',
              name: '[name].[ext]',
              outputPath,
            },
          },
          // XXX: disabled for now as it always output webp, which is not diplayed
          // by many browsers.
          // image-webpack-loader does'nt work well on debian 9 and travis for now
          // https://github.com/tcoopman/image-webpack-loader/issues/142#issuecomment-380751197
          // {
          //   loader: 'image-webpack-loader',
          //   options: {
          //     bypassOnDebug: true,
          //     // XXX: dosen't work on travis
          //     mozjpeg: {
          //       enabled: false,
          //     },
          //     // XXX: doesn't work on debian 9
          //     pngquant: {
          //       enabled: false,
          //     },
          //     webp: {
          //       quality: 75,
          //     },
          //   },
          // },
        ],
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          mimetype: 'image/svg+xml',
          name: '[name].[ext]',
          outputPath,
        },
      },
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          mimetype: 'application/font-woff',
          name: '[name].[ext]',
          outputPath,
        },
      },
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          mimetype: 'application/font-woff',
          name: '[name].[ext]',
          outputPath,
        },
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          mimetype: 'application/octet-stream',
          name: '[name].[ext]',
          outputPath,
        },
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: { name: '[name].[ext]', outputPath },
      },
    ],
  },
});

const configureNoAssets = () => ({
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        loader: 'null-loader',
      },
    ],
  },
});

const configureVendorSplit = () => ({
  entry: {
    vendor: [
      'async-validator',
      'axios',
      'bn.js',
      'classnames',
      'elliptic',
      'history',
      'lodash',
      'moment-timezone',
      'openpgp',
      'prop-types',
      'react',
      'react-country-region-selector',
      'react-datepicker',
      'react-dom',
      'react-modal',
      'react-moment',
      'react-redux',
      'react-redux-notify',
      'react-router-dom',
      'redux',
      'redux-axios-middleware',
      'redux-form',
      'reselect',
      'uuid',
      'xregexp',
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: 'initial',
          name: 'vendor',
          test: 'vendor',
          enforce: true,
        },
      },
    },
    runtimeChunk: {
      name: 'manifest',
    },
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
    plugins: [new webpack.DefinePlugin(defined)],
  };
};

module.exports = {
  configureSrcTsLoader,
  configureStylesheet,
  configureAssets,
  configureNoAssets,
  configureVendorSplit,
  configureHTMLTemplate,
  configureEnv,
};
