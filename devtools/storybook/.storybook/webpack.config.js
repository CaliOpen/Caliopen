const path = require('path');
const webpack = require('webpack');

module.exports = function configure(storybookBaseConfig) {
  storybookBaseConfig.module.loaders.push(
    {
      test: /\.css$/,
      loaders: ['style', 'css'],
    },
    {
      test: /\.scss$/,
      loaders: ['style', 'css', 'sass'],
    },
    {
      test: /\.(jpe?g|png|gif|svg)$/i,
      loaders: [
        'file?hash=sha512&digest=hex&name=[hash].[ext]',
        'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false',
      ],
    },
    { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader?mimetype=image/svg+xml' },
    { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader?mimetype=application/font-woff' },
    { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader?mimetype=application/font-woff' },
    { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader?mimetype=application/octet-stream' },
    { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader' },
    { test: /\.md$/, loader: 'raw-loader' },
    { test: /\.json$/, loader: 'json-loader' }
  );
  storybookBaseConfig.plugins.push(
    new webpack.DefinePlugin({
      CALIOPEN_ENV: JSON.stringify(process.env.NODE_ENV),
      BUILD_TARGET: JSON.stringify('browser'),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    })
  );
  storybookBaseConfig.sassLoader = {
    includePaths: [
      path.resolve(__dirname, '../src'),
      path.resolve(__dirname, '../node_modules/foundation-sites/scss'),
      path.resolve(__dirname, '../node_modules/font-awesome/scss'),
    ],
  };

  storybookBaseConfig.entry.preview.unshift('script-loader!jquery', 'script-loader!foundation-sites');

  return storybookBaseConfig;
};
