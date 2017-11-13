const seal = require('../lib/seal');
const Auth = require('../lib/Auth');
const { getConfig } = require('../../config');
const { COOKIE_NAME, COOKIE_OPTIONS } = require('../lib/cookie');
const { DEFAULT_REDIRECT } = require('../lib/redirect');

const ERR_REQUIRED = 'ERR_REQUIRED';
const ERR_INVALID = 'ERR_INVALID';

const authenticateAfterSignup = (req, res, next) => {
  const { username, password } = req.body;
  const auth = new Auth();

  auth.authenticate({
    username,
    password,
    response: function responseCallback(response) {
      if (req.accepts('json')) {
        res.status(response.statusCode);
      }
    },
    success: function successCallback(user) {
      if (!user || !Object.keys(user).length) {
        next(new Error('Expected user to be defined and not empty in Auth API success callback'));

        return;
      }

      const { seal: { secret } } = getConfig();

      seal.encode(
        user,
        secret,
        (err, sealed) => {
          if (err || !seal) {
            next(err || new Error('Unexpected Error'));

            return;
          }
          res.cookie(COOKIE_NAME, sealed, COOKIE_OPTIONS);
          const redirect = req.query.redirect || DEFAULT_REDIRECT;
          res.redirect(redirect);
        }
      );
    },
    error: () => {
      const error = new Error('Unable to automatically authenticate after signup');
      error.status = 502;
      next(error);
    },
  });
};

const createSignupRouting = (router) => {
  router.post('/signup', (req, res, next) => {
    let hasError = false;
    const errors = {};

    if (!req.body || !Object.keys(req.body).length) {
      const err = new Error('Bad request');
      err.status = 400;

      throw err;
    }

    const values = {
      username: req.body.username,
      password: req.body.password,
      recovery_email: req.body.recovery_email,
    };

    if (!values.username) {
      hasError = true;
      errors.username = [ERR_REQUIRED];
    }

    if (!values.password) {
      hasError = true;
      errors.password = [ERR_REQUIRED];
    }

    // Alpha: hide TOS checkbox
    // if (!req.body.tos) {
    //   hasError = true;
    //   errors.tos = [ERR_REQUIRED];
    // }

    if (hasError) {
      res.status(400).send({ errors });

      return;
    }

    const auth = new Auth();

    auth.signup({
      body: values,
      success: () => {
        authenticateAfterSignup(req, res, next);
      },
      error: (error) => {
        error = error || new Error('Bad gateway');
        if (error.status && error.status >= 400 && error.status < 500) {
          errors.global = [ERR_INVALID];
          res.status(error.status).send({ errors });

          return;
        }

        error.status = error.status || 502;
        next(error);
      },
    });
  });
};

module.exports = createSignupRouting;
