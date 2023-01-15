import merge from 'lodash/merge';

let config =
  BUILD_TARGET === 'browser' && typeof window !== 'undefined'
    ? // @ts-ignore
      { ...window.__INSTANCE_CONFIG__, ...CALIOPEN_OPTIONS } // eslint-disable-line no-underscore-dangle
    : // @ts-ignore
      CALIOPEN_OPTIONS;

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

const getMaxSize = () => {
  const { maxBodySize } = getConfig();
  const numberSize = maxBodySize
    .toLowerCase()
    .replace('kb', '000')
    .replace('mb', '000000');

  return Number(numberSize);
};

export { getBaseUrl, initConfig, getConfig, getMaxSize };
