import merge from 'lodash.merge';
import defaults from '../../config/server.default';
import envVars from '../../config/server.env-var';

let config = merge(defaults, envVars);

export const initConfig = (forceDefaults) => {
  config = merge(defaults, forceDefaults, envVars);
};

export const getConfig = () => config;

export const getApiHost = () => {
  const {
    api: { hostname, port, protocol },
  } = getConfig();

  return `${protocol}://${hostname}:${port}`;
};
