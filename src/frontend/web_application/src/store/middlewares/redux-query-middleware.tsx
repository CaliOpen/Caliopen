import { AxiosRequestConfig, Method } from 'axios';
import {
  queryMiddleware,
  NetworkInterface,
  NetworkOptions,
  HttpMethods,
} from 'redux-query';
import superagentInterface from 'redux-query-interface-superagent';
import { RootState } from '../reducer';
import getClient from '../../services/api-client';

const getAxiosRequestConfig = (
  networkOptions: NetworkOptions
): AxiosRequestConfig => {
  return {
    headers: networkOptions.headers,
  };
};
const createRequest = (url: string, method: HttpMethods, body, config) => {
  const client = getClient();

  switch (method.toLowerCase()) {
    case 'get':
      return client.get(url, config);
    case 'post':
      return client.post(url, body, config);
    case 'put':
      return client.put(url, body, config);
    case 'patch':
      return client.patch(url, body, config);
    case 'delete':
      return client.delete(url, config);
    case 'head':
      return client.head(url, config);
    case 'options':
      return client.options(url, config);
  }
};
const networkInterface: NetworkInterface = (url, method, options) => {
  const responsePromise = createRequest(url, method, options.body, {
    headers: {
      // FIXME: custom middleware
      'X-Caliopen-IL': '-10;10',
      ...options.headers,
    },
  });

  // if (headers) {
  //   request.set(headers);
  // }

  // if (credentials === 'include') {
  //   request.withCredentials();
  // }

  const execute = (cb) => {
    responsePromise?.then(
      (response) =>
        cb(
          undefined,
          response.status,
          response.data,
          response.statusText,
          response.headers
        ),
      (err) =>
        cb(
          err,
          err.response.status,
          err.response.data,
          err.response.statusText,
          err.response.headers
        )
    );
  };
  const abort = () => {};
  // request.end((err, response) => {
  //   const resStatus = (response && response.status) || 0;
  //   const resBody = (response && response.body) || undefined;
  //   const resText = (response && response.text) || undefined;
  //   const resHeaders = (response && response.header) || undefined;

  //   cb(err, resStatus, resBody, resText, resHeaders);
  // });

  // const abort = () => request.abort();

  return {
    abort,
    execute,
  };
};

export const getQueries = (state: RootState) => state.queries;
export const getEntities = (state: RootState) => state.entities;

export default queryMiddleware(networkInterface, getQueries, getEntities);

// export const signReduxQueryMiddleware
