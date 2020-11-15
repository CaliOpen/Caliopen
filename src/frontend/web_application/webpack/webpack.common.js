const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const mode = isDev ? 'development' : 'production';

module.exports = {
  mode,
  devtool: isDev ? 'eval' : 'source-map',
  entry: {
    app: [],
    vendor: [],
  },
  output: {},
  plugins: [],
  module: {
    rules: [],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    // to match paths in ts config
    alias: {
      src: path.resolve(__dirname, '../src'),
    },
  },
};
