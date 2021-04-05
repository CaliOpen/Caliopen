import axios, { AxiosTransformer, AxiosInstance } from 'axios';
import { getBaseUrl } from '../config';
import { importanceLevelHeader } from '../importance-level';
import { queryStringify } from 'src/modules/routing';
import { getSignatureHeaders } from 'src/modules/device/services/signature';
import UploadFileAsFormField from 'src/modules/file/services/uploadFileAsFormField';

interface AppHeaders {
  [key: string]: string;
}
let client: AxiosInstance;
let signingClient: AxiosInstance;

let headers: AppHeaders = {
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
  const {
    getSubRequestHeaders,
  } = require('../../../server/api/lib/sub-request-manager'); // eslint-disable-line global-require
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
    paramsSerializer: (params) => queryStringify(params),
    transformRequest: [
      (data) => {
        if (data instanceof UploadFileAsFormField) {
          return data.toFormData();
        }

        return data;
      },
      ...(axios.defaults.transformRequest as AxiosTransformer[]),
    ],
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

// TODO mv or delete: useless or related to redux
export const handleClientResponseSuccess = (response) => {
  if (!response || !response.payload) {
    throw new Error('Not an axios success Promise');
  }

  return response.payload.data;
};

export const handleClientResponseError = (payload) => {
  if (payload instanceof Error) {
    throw payload;
  }

  if (!payload || !payload.error || !payload.error.response) {
    console.error({ payload });
    throw new Error('Not an axios catched Promise');
  }

  return payload.error.response.data.errors;
};

export const tryCatchAxiosAction = async (action) => {
  try {
    const response = await action();

    return handleClientResponseSuccess(response);
  } catch (err) {
    return Promise.reject(handleClientResponseError(err));
  }
};

export const tryCatchAxiosPromise = async (prom) => {
  try {
    const response = await prom;

    return handleClientResponseSuccess(response);
  } catch (err) {
    return Promise.reject(handleClientResponseError(err));
  }
};

export function handleAxiosPromise(prom) {
  return prom.then(handleClientResponseSuccess, (err) =>
    Promise.reject(handleClientResponseError(err))
  );
}
