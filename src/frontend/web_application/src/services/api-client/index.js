import axios from 'axios';
import { getBaseUrl } from '../config';
import { importanceLevelHeader } from '../importance-level';
import { queryStringify } from '../url/QueryStringSerializer';
import { getSignatureHeaders } from '../../modules/device/services/signature';
import UploadFileAsFormField from '../../modules/file/services/uploadFileAsFormField';

let client;
let signingClient;

let headers = {
  ...importanceLevelHeader,
  'X-Caliopen-PI': '0;100',
};

if (BUILD_TARGET !== 'server') {
  headers = {
    ...headers,
    'X-Requested-With': 'XMLHttpRequest',
  };
}

if (BUILD_TARGET === 'server') {
  // eslint-disable-next-line global-require
  const { getSubRequestHeaders } = require('../../../server/api/lib/sub-request-manager');
  headers = {
    ...headers,
    ...getSubRequestHeaders(),
  };
}

const buildClient = () =>
  axios.create({
    baseURL: getBaseUrl(),
    responseType: 'json',
    headers,
    paramsSerializer: params => queryStringify(params, headers),
    transformRequest: ([(data) => {
      if (data instanceof UploadFileAsFormField) {
        return data.toFormData();
      }

      return data;
    }]).concat(axios.defaults.transformRequest),
  });

export const getUnsignedClient = () => {
  if (!client) {
    client = buildClient();
  }

  return client;
};

export default function getClient() {
  if (!signingClient) {
    signingClient = buildClient();

    signingClient.interceptors.request.use(async (config) => {
      const signatureHeaders = await getSignatureHeaders(config);

      return {
        ...config,
        headers: {
          ...config.headers,
          ...signatureHeaders,
        },
      };
    });
  }

  return signingClient;
}

export const handleClientResponseSuccess = (response) => {
  if (!response || !response.payload) {
    throw new Error('Not an axios success Promise');
  }

  return Promise.resolve(response.payload.data);
};

export const handleClientResponseError = (payload) => {
  if (!payload || !payload.error || !payload.error.response) {
    throw new Error('Not an axios catched Promise', payload);
  }

  return Promise.reject(payload.error.response.data.errors);
};

export const tryCatchAxiosAction = async (action) => {
  try {
    const response = await action();

    return handleClientResponseSuccess(response);
  } catch (err) {
    return handleClientResponseError(err);
  }
};

export const tryCatchAxiosPromise = async (prom) => {
  try {
    const response = await prom;

    return handleClientResponseSuccess(response);
  } catch (err) {
    return handleClientResponseError(err);
  }
};
