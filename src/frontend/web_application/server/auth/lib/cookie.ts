import type { Response } from 'express';

import { encode } from './seal';
import { getConfig } from '../../config';

export const COOKIE_NAME = 'caliopen.web';
export const COOKIE_OPTIONS = {
  signed: true,
  domain: undefined,
  path: '/',
};

const getCookieOptions = () => {
  const { hostname } = getConfig();

  return { ...COOKIE_OPTIONS, domain: hostname };
};

export const authenticate = (res: Response, { user }) => {
  const {
    seal: { secret },
  } = getConfig();

  return encode(user, secret).then(
    (sealed) => {
      res.cookie(COOKIE_NAME, sealed, getCookieOptions());
    },
    () => {
      return Promise.reject('Unexpected Error');
    }
  );
};

export const invalidate = (res: Response) =>
  res.clearCookie(COOKIE_NAME, getCookieOptions());
