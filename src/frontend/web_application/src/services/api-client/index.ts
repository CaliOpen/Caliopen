import axios, { AxiosInstance } from 'axios';
import { getBaseUrl } from '../config';
import { importanceLevelHeader } from '../importance-level';
import { queryStringify } from '../../modules/routing';
import { getSignatureHeaders } from '../../modules/device/services/signature';
import UploadFileAsFormField from '../../modules/file/services/uploadFileAsFormField';

let client: AxiosInstance;
let signingClient: AxiosInstance;

let headers: Record<string, string> = {
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
  } = require('../../../server/api/lib/sub-request-manager'); // eslint-disable-line global-require,@typescript-eslint/no-var-requires
  headers = {
    ...headers,
    ...getSubRequestHeaders(),
  };
}

const buildClient = (): AxiosInstance =>
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
      // @ts-ignore: typed as undef or not an array
    ].concat(axios.defaults.transformRequest),
  });

export const getUnsignedClient = (): AxiosInstance => {
  if (!client) {
    client = buildClient();
  }

  return client;
};

export default function getClient(): AxiosInstance {
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

/**
 * @deprecated
 */
export const tryCatchAxiosAction = async (action) => {
  try {
    const response = await action();

    return handleClientResponseSuccess(response);
  } catch (err) {
    return Promise.reject(handleClientResponseError(err));
  }
};

/**
 * @deprecated
 */
export const tryCatchAxiosPromise = async (prom) => {
  try {
    const response = await prom;

    return handleClientResponseSuccess(response);
  } catch (err) {
    return Promise.reject(handleClientResponseError(err));
  }
};

/**
 * @deprecated
 */
export function handleAxiosPromise(prom) {
  return prom.then(handleClientResponseSuccess, (err) =>
    Promise.reject(handleClientResponseError(err))
  );
}
