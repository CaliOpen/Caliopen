const cyphered = require('../lib/seal');
const { getConfig } = require('../../config');

const decodeCookie = (req, res, next) => {
  const { seal: { secret } } = getConfig();
  const seal = req.seal;

  if (!seal && req.security === false) {
    next();

    return;
  }

  cyphered.decode(seal, secret, (err, obj) => {
    if (err || !obj) {
      const error = new Error('Unexpected Server Error on cookie decoding');
      error.status = 500;
      error.err = err;

      next(error);

      return;
    }

    req.user = obj;

    next();
  });
};

module.exports = decodeCookie;
