import axios from 'axios';
import { FetchArgs, fetchBaseQuery } from '@rtk-incubator/rtk-query/react';
import { BaseQueryApi } from '@rtk-incubator/rtk-query/dist/esm/ts/baseQueryTypes';
import { FetchBaseQueryArgs } from '@rtk-incubator/rtk-query/dist/esm/ts/fetchBaseQuery';
import { getBaseUrl } from '../config';
import { importanceLevelHeader } from '../importance-level';
import { queryStringify } from '../../modules/routing';
import { getSignatureHeaders } from '../../modules/device/services/signature';
import UploadFileAsFormField from '../../modules/file/services/uploadFileAsFormField';

// Common ---------------------------------------

export let headersInit: HeadersInit = {
  ...importanceLevelHeader,
  'X-Caliopen-PI': '0;100',
};

if (BUILD_TARGET !== 'server') {
  headersInit = {
    ...headersInit,
    'X-Requested-With': 'XMLHttpRequest',
  };
}

if (BUILD_TARGET === 'server') {
  const {
    getSubRequestHeaders,
  } = require('../../../server/api/lib/sub-request-manager'); // eslint-disable-line global-require
  headersInit = {
    ...headersInit,
    ...getSubRequestHeaders(),
  };
}

// export var headersInit;

// rtk-query components -------------------------

// import { store } from 'src/modules/importance';
// import { RootState } from 'src/store/reducer';
// const prepareImportanceLevelHeaders = (headers: Headers, { getState }: { getState: () => RootState }) => {
//   // XXX: has no effects for now, discussion are filtered on client side
//   const [min, max] = store.importanceLevelSelector(getState());
//   headers.append('X-Caliopen-IL', `${min};${max}`);

//   return headers;
// }

interface FetchQueryParams extends FetchBaseQueryArgs {}

export function fetchQuery({
  baseUrl = getBaseUrl(),
  prepareHeaders = (headers) => headers,
  headers = {},
  ...rest
}: FetchQueryParams) {
  return async function signedQuery(
    arg: string | FetchArgs,
    api: BaseQueryApi,
    extraOptions: {}
  ) {
    const { url, params = {}, body = undefined } =
      typeof arg === 'string' ? { url: arg } : arg;

    const signHeaders = await getSignatureHeaders({
      method: 'GET',
      url,
      params,
      data: body,
    });

    return fetchBaseQuery({
      baseUrl,
      prepareHeaders: (headers, api) => {
        Object.entries<string>(signHeaders).forEach(([name, value]) => {
          headers.set(name, value);
        });

        return prepareHeaders(headers, api);
      },
      headers: {
        ...headersInit,
        ...headers,
      },
      ...rest,
    })(arg, api, extraOptions);
  };
}

// Axios components -----------------------------

let client;
let signingClient;

const buildClient = () =>
  axios.create({
    baseURL: getBaseUrl(),
    responseType: 'json',
    headers: headersInit,
    // @ts-ignore: FIXME: headersInit added for some reason but useless
    paramsSerializer: (params) => queryStringify(params, headersInit),
    transformRequest: [
      (data) => {
        if (data instanceof UploadFileAsFormField) {
          return data.toFormData();
        }

        return data;
      },
    ].concat(axios.defaults.transformRequest || []),
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
// ----------------------------------------------
