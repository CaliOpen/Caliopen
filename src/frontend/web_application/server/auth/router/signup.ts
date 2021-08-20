import type { Router } from 'express';
import { query } from '../../api/lib/api';
import { authenticate } from '../lib/cookie';
import { ServerError } from '../../error/consts';

const CONTEXT_SAFE = 'safe';

const createSignupRouting = (router: Router) => {
  router.post('/signup', async (req, res, next) => {
    try {
      await query(
        { path: '/api/v1/users', method: 'post', headers: req.headers },
        { body: req.body }
      );
    } catch (err) {
      const error = new ServerError(`Unable to signup: ${err.message}`);
      error.status = 400;

      return next(error);
    }

    const { username, password, device } = req.body;

    try {
      const user = await query(
        {
          path: '/api/v1/authentications',
          method: 'post',
        },
        {
          body: { username, password, device, context: CONTEXT_SAFE },
        }
      );

      await authenticate(res, { user });

      return res.status(204).send();
    } catch (err) {
      const error = new ServerError(
        `Unable to automatically authenticate after signup: ${err.message}`
      );
      return next(error);
    }
  });
};

export default createSignupRouting;
