const securityMiddleware = (req, res, next) => {
  const security = {
    firewalls: {
      assets: {
        paths: [/^\/assets\/.*$/],
        security: false,
      },
      auth: {
        paths: [
          /^\/auth\/.*/,
          '/api/v2/username/isAvailable', /^\/api\/v2\/passwords\/reset(\/.*)?/,
        ],
        security: false,
      },
      default: {
        security: true,
      },
    },
  };
  const isRegexp = val => typeof val.test === 'function';
  const hasRequestPath = (paths) => {
    if (paths.indexOf(req.path) !== -1) {
      return true;
    }

    return paths.filter(isRegexp).reduce((acc, path) => {
      if (acc) {
        return acc;
      }

      return path.test(req.path);
    }, false);
  };

  const isSecure = Object.keys(security.firewalls)
    .filter(key => key !== 'default')
    .reduce((prev, curr) => {
      if (prev !== undefined) {
        return prev;
      }

      if (hasRequestPath(security.firewalls[curr].paths)) {
        return security.firewalls[curr].security;
      }

      return prev;
    }, undefined);

  req.security = isSecure !== undefined ? isSecure : security.firewalls.default.security;

  next();
};

module.exports = securityMiddleware;
