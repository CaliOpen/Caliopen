import proxy from 'express-http-proxy';
import url from 'url';

const { getConfig, getApiHost } = require('../config');

export default (app) => {
  const {
    api: { checkCertificate },
    maxBodySize,
  } = getConfig();
  const target = getApiHost();

  app.use(
    '/api',
    proxy(target, {
      limit: maxBodySize,
      proxyReqPathResolver: (req) => url.parse(req.originalUrl).path,
      proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        const decoratedReqOpts = {
          ...proxyReqOpts,
          rejectUnauthorized: checkCertificate,
        };

        if (!srcReq.user) {
          return decoratedReqOpts;
        }

        // TODO refactor in Auth library may be or ...
        const bearer = new Buffer(
          `${srcReq.user.user_id}:${srcReq.user.tokens.access_token}`
        ).toString('base64');

        return {
          ...decoratedReqOpts,
          headers: {
            ...proxyReqOpts.headers,
            Authorization: `Bearer ${bearer}`,
          },
        };
      },
    })
  );
};
