module.exports = {
  protocol: process.env.CALIOPEN_PROTOCOL,
  hostname: process.env.CALIOPEN_HOSTNAME,
  port: process.env.CALIOPEN_PORT,
  webServer: {
    port: process.env.CALIOPEN_WEB_SERVER_PORT,
    hostname: process.env.CALIOPEN_WEB_SERVER_HOSTNAME,
  },
  api: {
    protocol: process.env.CALIOPEN_API_PROTOCOL,
    hostname: process.env.CALIOPEN_API_HOSTNAME,
    port: process.env.CALIOPEN_API_PORT,
    checkCertificate: process.env.CALIOPEN_CHECK_CERTIFICATE,
  },
  cookie: {
    secret: process.env.CALIOPEN_COOKIE_SECRET,
  },
  seal: {
    secret: process.env.CALIOPEN_SEAL_SECRET,
  },
  maxBodySize: process.env.CALIOPEN_MAX_BODY_SIZE,
  enableSyslog: process.env.CALIOPEN_ENABLE_SYSLOG,
};
