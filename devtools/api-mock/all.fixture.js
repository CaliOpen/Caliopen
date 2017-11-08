require('babel-core/register');
require('babel-polyfill');

module.exports = {
  default: [
    require('./authentications').default,
    require('./me').default,
    require('./discussions').default,
    require('./local_identities').default,
    require('./contacts').default,
    require('./messages').default,
    require('./participants').default,
    require('./search').default,
    require('./settings').default,
    require('./tags').default,
  ],
};
