const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const DashboardPlugin = require('webpack-dashboard/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const { CommonsChunkPlugin } = require('webpack').optimize;


const DASHBOARD = process.env.DASHBOARD ? JSON.parse(process.env.DASHBOARD) : true;

const initialConfig = {
  entry: {
    app: [],
    vendor: [],
  },
  output: {},
  plugins: [],
  module: {
    preLoaders: [],
    loaders: [],
  },
};

const configureStylesheet = (config, filename = 'client_[name]', relativePath = '') => {
  const extractTextPlugin = new ExtractTextPlugin(relativePath + filename, { allChunks: true });
  const cfg = Object.assign({}, config, {
    sassLoader: {
      includePaths: [
        path.resolve(__dirname, '../src'),
        path.resolve(__dirname, '../node_modules/foundation-sites/scss'),
        path.resolve(__dirname, '../node_modules/font-awesome/scss'),
        path.resolve(__dirname, '../node_modules/react-redux-notify/src'),
      ],
    },
    sasslint: {
      configFile: path.resolve(__dirname, '../.sass-lint.yml'),
    },
  });
  cfg.plugins.push(
    extractTextPlugin,
    new OptimizeCssAssetsPlugin({
      canPrint: false,
    })
  );
  cfg.module.loaders.push(
    {
      test: /\.css$/,
      loader: extractTextPlugin.extract('style-loader', 'css-loader?sourceMap'),
    },
    {
      test: /\.scss$/,
      loader: extractTextPlugin.extract('style-loader', 'css-loader?sourceMap!postcss-loader?sourceMap!sass-loader'),
    }
  );

  cfg.module.preLoaders.push({
    test: /\.scss$/,
    include: path.join(__dirname, '../src/'),
    loader: 'sasslint',
  });

  return cfg;
};

const configureAssets = (config, outputPath = 'assets/') => {
  config.module.loaders.push(
    {
      test: /\.(jpe?g|png|gif)$/i,
      loaders: [
        `file-loader?hash=sha512&digest=hex&name=[name].[ext]&outputPath=${outputPath}`,
        'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false',
      ],
    },
    { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: `file-loader?mimetype=image/svg+xml&name=[name].[ext]&outputPath=${outputPath}` },
    { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: `file-loader?mimetype=application/font-woff&name=[name].[ext]&outputPath=${outputPath}` },
    { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: `file-loader?mimetype=application/font-woff&name=[name].[ext]&outputPath=${outputPath}` },
    { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: `file-loader?mimetype=application/octet-stream&name=[name].[ext]&outputPath=${outputPath}` },
    { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: `file-loader?name=[name].[ext]&outputPath=${outputPath}` }
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
        HAS_HMR: process.env.HAS_HMR || true,
        HAS_SSR: process.env.HAS_SSR || true,
        CALIOPEN_ENV: JSON.stringify(process.env.NODE_ENV),
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }),
    ];
    if (DASHBOARD) {
      plugins.push(new DashboardPlugin());
    }

    return Object.assign(initialConfig, {
      plugins,
      module: Object.assign(initialConfig.module, {
        loaders: [
          {
            test: /\.jsx?$/,
            include: path.join(__dirname, '../src/'),
            exclude: /node_modules/,
            loaders: ['babel-loader', 'eslint-loader'],
          },
        ],
      }),
      resolve: {
        extensions: ['', '.js', '.jsx'],
      },
    });
  },
};
