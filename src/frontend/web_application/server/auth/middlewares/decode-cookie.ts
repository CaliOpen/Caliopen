import { decode } from '../lib/seal';
import { COOKIE_NAME } from '../lib/cookie';
import { getConfig } from '../../config';

class ResponseError extends Error {
  status: number;
  err: any;
}

export const decodeCookieMiddleware = (req, res, next) => {
  const {
    seal: { secret },
  } = getConfig();
  const cookie = req.signedCookies && req.signedCookies[COOKIE_NAME];

  if (!cookie) {
    next();

    return;
  }

  decode(cookie, secret).then(
    (obj) => {
      req.user = obj;

      // TODO: refresh token
      // new Date(Date.UTC(req.user.tokens.expires_at)).getTime() < new Date().getTime() + (1000 * 60 * 10)

      next();
    },
    (err) => {
      const error = new ResponseError(
        'Unexpected Server Error on cookie decoding'
      );
      error.status = 500;
      error.err = err;

      next(error);
    }
  );
};
