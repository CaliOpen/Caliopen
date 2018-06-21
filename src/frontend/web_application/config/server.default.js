module.exports = {
  // the public url of the instance
  protocol: 'http',
  hostname: 'localhost',
  port: 80,
  // the internal url of the expressjs server
  webServer: {
    port: 4000,
    hostname: undefined,
  },
  // the internal url of the backend
  api: {
    protocol: 'http',
    hostname: 'api.dev.caliopen.org',
    port: 31415,
    checkCertificate: true,
  },
  cookie: {
    secret: '_4+%J;_F&?#!+mR&IsYq:Xg4A*wvse',
  },
  seal: {
    secret: 'D}(2$5q)#_#yKX90,+0d5?4**a6ws8e`', // at least 32 chars
  },
  maxBodySize: '5mb',
  enableSyslog: false,
};
