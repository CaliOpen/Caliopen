const path = require('path');
const { merge } = require('webpack-merge');
const OfflinePlugin = require('offline-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const configs = require('./config.js');
const common = require('./webpack.common.js');

const PUBLIC_PATH = '/';
const isDev = process.env.NODE_ENV === 'development';

const base = {
  target: 'web',
  entry: {
    app: [
      '@babel/polyfill',
      'script-loader!jquery',
      'script-loader!foundation-sites',
      path.join(__dirname, '../src/index.jsx'),
    ],
    vendor: [
      '@babel/polyfill',
      'script-loader!jquery',
      'script-loader!foundation-sites',
    ],
  },
  output: {
    path: path.join(__dirname, '..', 'dist/server/public'),
    filename: isDev ? '[name].js' : '[name].[chunkhash].js',
    chunkFilename: isDev ? '[name].js' : '[name].[chunkhash].js',
    publicPath: PUBLIC_PATH,
  },
};

const configurePWA = () => ({
  plugins: [
    new WebpackPwaManifest({
      name: 'Caliopen',
      short_name: 'Caliopen',
      description: 'Private messages aggregator with privacy',
      background_color: '#2196f3',
      theme_color: '#ffffff',
      icons: [
        {
          src: path.join(__dirname, '..', 'assets/caliopen-icon.png'),
          sizes: [96, 128, 192, 256, 384, 512],
        },
        {
          src: path.join(__dirname, '..', 'assets/caliopen-logo.png'),
          size: '1022x265',
        },
      ],
      ios: true,
    }),
    // FIXME: disabled, webpak5 no supported: https://github.com/NekR/offline-plugin/issues/491
    // new OfflinePlugin({
    //   appShell: '/about',
    //   responseStrategy: 'network-first',
    //   externals: [
    //     '/',
    //     // disable caching of authenticated routes since the plugin tries to preload its
    //     // '/api/v1/me',
    //     // '/api/v1/settings',
    //   ],
    //   excludes: ['**/*.worker.js'],
    //   relativePaths: false,
    //   ServiceWorker: {
    //     output: 'offline.worker.js',
    //     navigationPreload: false,
    //     events: true,
    //   },
    // }),
  ],
});

const configureDevServer = () => {
  if (!isDev) {
    return {};
  }

  return {
    devServer: {
      // using a hostname like caliopen.local, it requires this:
      // https://github.com/webpack/webpack-dev-server/issues/1604
      disableHostCheck: true,
      contentBase: false,
      hot: false,
      inline: true,
      liveReload: false,
      port: '8080',
      proxy: {
        '/': {
          target: 'http://localhost:4001',
        },
      },
    },
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000,
    },
  };
};

const config = merge(
  common,
  configs.configureSrcTsLoader(),
  configs.configureStylesheet(),
  configs.configureAssets(),
  configs.configureVendorSplit(),
  configs.configureHTMLTemplate(),
  configs.configureEnv('browser'),
  configurePWA(),
  configureDevServer(),
  base
);

module.exports = config;
