const path = require('path');

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  devtool: isDev ? 'eval' : 'source-map',
  entry: {
    app: [],
    vendor: [],
  },
  output: {},
  plugins: [],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [
          path.join(__dirname, '../src/'),
        ],
        use: ['babel-loader', 'eslint-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
