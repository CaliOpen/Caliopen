import express from 'express';
import applyAPI from './api';
import applyAssets from './assets';
import applyAuth from './auth';
import applyError from './error';
import { configure as applyExpressReact } from './express-react';
import applySSR from './ssr';
import { httpLog } from './logger';

export default () => {
  const app = express();

  app.use('*', httpLog);

  //-------
  // assets always public
  applyAssets(app);
  applyAuth(app);
  applyAPI(app);
  applyExpressReact(app);
  applySSR(app);
  applyError(app);

  return app;
};
