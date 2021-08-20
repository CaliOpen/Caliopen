import http from 'http';
import https from 'https';
import createDebug from 'debug';
import { getConfig } from '../../config';
import { ServerError } from '../../error/consts';

const debug = createDebug('caliopen.web:app:api-query');

type RequestParams = http.RequestOptions | https.RequestOptions;

interface Options {
  body?: string | Record<string, any>;
}

/**
 * Internal promisified requests.
 * This is a basic wrapper that use current host configuration to make requests on the API.
 *
 * @returns data from response in a Promise
 */
export const query = (
  requestParams: RequestParams,
  opts: Options = {}
): Promise<string | Array<any> | Record<string, any>> => {
  return new Promise((resolve, reject) => {
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
      ...opts,
    };

    let postData: undefined | string;
    if (options.body) {
      postData = JSON.stringify(options.body);
      params.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    if (!checkCertificate && protocol === 'https') {
      // @ts-ignore: this param only exists for `https.RequestOptions`
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

      const data: Array<Buffer> = [];

      res.on('data', (chunk) => {
        data.push(chunk);
      });

      res.on('end', () => {
        let responseBody = Buffer.concat(data).toString();

        if (
          res.headers['content-type'] &&
          res.headers['content-type'].indexOf('json') !== -1
        ) {
          responseBody = JSON.parse(responseBody);
        }

        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(responseBody);
        } else {
          const error = new ServerError(
            `API Query Error ${res.statusCode} : ${res.statusMessage}`
          );
          if (res.statusCode) {
            error.status = res.statusCode;
          }
          reject(error);
        }
      });
    });

    if (postData) {
      req.write(postData);
    }

    debug('\n', 'Outgoing API query:', '\n', req);

    req.end();
  });
};
