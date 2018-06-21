const logger = require('../../logger')();

const isDev = process.env.NODE_ENV === 'development';

const catchError = (err, req, res, next) => {
  if (!err.status || err.status >= 500) {
    logger.error(err.message);
  } else {
    logger.info(err.message);
  }

  const publicError = {
    status: err.status,
    message: err.message,
    error: isDev ? err : {},
    stack: isDev ? err.stack : '',
  };

  if (req.accepts('json')) {
    res.status(err.status).json(publicError);

    return;
  }

  if (req.accepts('html')) {
    res.status(err.status).render('error.component', publicError);

    return;
  }

  next(err);
};

module.exports = catchError;
