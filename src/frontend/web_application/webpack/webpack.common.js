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
    rules: [
      {
        test: /\.jsx?$/,
        include: [
          path.join(__dirname, '../src/'),
        ],
        use: [
          { loader: 'babel-loader' },
          {
            loader: 'eslint-loader',
            options: {
              cache: true,
              failOnError: false,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
