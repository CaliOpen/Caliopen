import merge from 'lodash.merge';

let config =
  BUILD_TARGET === 'browser' && typeof window !== 'undefined'
    ? // eslint-disable-next-line no-underscore-dangle
      { ...window.__INSTANCE_CONFIG__, ...CALIOPEN_OPTIONS }
    : CALIOPEN_OPTIONS;

const initConfig = (cfg) => {
  config = merge(config, cfg);
};
const getConfig = () => config;
const getBaseUrl = () => {
  if (BUILD_TARGET === 'browser') {
    return '';
  }

  if (BUILD_TARGET === 'server') {
    const { protocol, hostname, port } = getConfig();

    return `${protocol}://${hostname}:${port}`;
  }

  throw new Error(`Unsupported build target "${BUILD_TARGET}"`);
};
const getAPIBaseUrl = () => `${getBaseUrl()}/api`;

const getMaxSize = () => {
  const { maxBodySize } = getConfig();
  const numberSize = maxBodySize
    .toLowerCase()
    .replace('kb', '000')
    .replace('mb', '000000');

  return Number(numberSize);
};

export { getBaseUrl, getAPIBaseUrl, initConfig, getConfig, getMaxSize };
