const checkToken = (req, res, next) => {
  if (!req.user && req.security === false) {
    next();

    return;
  }

  const user = req.user;
  const tokens = user.tokens;

  // FIXME: tokenLooksGood()
  // can we work with this access_token?
  if (
    !tokens.access_token || !tokens.refresh_token || !tokens.expires_at
  ) {
    const error = new Error('Invalid tokens');
    error.status = 401;
    next(error);

    return;
  }

  // FIXME: tokenShouldRefresh()
  // is the access_token expired?
  // Or will expire in less than 10min
  if (
    new Date(Date.UTC(tokens.expires_at)).getTime() < new Date().getTime() + (1000 * 60 * 10)
  ) {
    const error = new Error('Expired token');
    error.status = 401;

    next(error);

    return;
    // Refresh the token
  }

  // We can definitely work with these tokens
  req.tokens = tokens;

  next();
};

module.exports = checkToken;
