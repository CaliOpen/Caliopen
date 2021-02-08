import { getLogger } from '../../logger';

const logger = getLogger();

const isDev = process.env.NODE_ENV === 'development';

const catchError = (err, req, res, next) => {
  if (!err.status || err.status >= 500) {
    logger.error(err.message);
  } else {
    logger.info(err.message);
  }

  const publicError = {
    status: err.status || 500,
    message: err.message || err,
    error: isDev ? err : {},
    stack: isDev ? err.stack : '',
  };

  if (req.accepts('html')) {
    res
      .status(publicError.status)
      .render('error.component', { error: publicError });

    return;
  }

  if (req.accepts('json')) {
    res.status(publicError.status).json(publicError);

    return;
  }

  next(err);
};

export default catchError;
