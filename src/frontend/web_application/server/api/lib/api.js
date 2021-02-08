import http from 'http';
import https from 'https';
import createDebug from 'debug';
import { getConfig } from '../../config';

const debug = createDebug('caliopen.web:app:api-query');

export const query = (requestParams = {}, opts = {}) => {
  const {
    api: { protocol, hostname, port, checkCertificate },
  } = getConfig();
  const params = {
    protocol: `${protocol}:`,
    hostname,
    port,
    ...requestParams,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(requestParams.headers || {}),
    },
  };

  const options = {
    body: undefined,
    response: () => {},
    success: () => {},
    error: () => {},
    ...opts,
  };

  let postData;
  if (options.body) {
    postData = JSON.stringify(options.body);
    params.headers['Content-Length'] = Buffer.byteLength(postData);
  }

  if (!checkCertificate) {
    params.rejectUnauthorized = false;
  }

  debug('\n', 'Preparing API query:', '\n', params);

  const request = protocol === 'https' ? https.request : http.request;
  const req = request(params, (res) => {
    debug(
      '\n',
      'API query response:',
      '\n',
      res.statusCode,
      res.statusMessage,
      res.headers
    );

    const data = [];

    res.on('data', (chunk) => {
      data.push(chunk);
    });

    res.on('end', () => {
      try {
        let responseBody = Buffer.concat(data).toString();

        if (
          res.headers['content-type'] &&
          res.headers['content-type'].indexOf('json') !== -1
        ) {
          responseBody = JSON.parse(responseBody);
        }

        if (res && res.statusCode >= 200 && res.statusCode < 300) {
          options.success(responseBody);
        } else {
          const error = new Error(
            `API Query Error ${res.statusCode} : ${res.statusMessage}`
          );
          error.status = res.statusCode;
          throw error;
        }
      } catch (e) {
        e.status = e.status || 500;
        options.error(e);
      }
    });
  })
    .on('response', options.response)
    .on('error', options.error);

  if (postData) {
    req.write(postData);
  }

  debug('\n', 'Outgoing API query:', '\n', req);

  req.end();

  return req;
};
