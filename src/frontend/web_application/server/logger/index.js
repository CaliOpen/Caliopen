const winston = require('winston');
const { Syslog } = require('winston-syslog');
const { getConfig } = require('../config');

const LOGGER_CATEGORY = 'caliopen-frontend';
const stdFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.label({ label: LOGGER_CATEGORY }),
  winston.format.printf(info => `${info.timestamp} ${info.level} ${info.label} - ${info.message}`),
);

let logger;

const getLogger = () => {
  if (!logger) {
    const { enableSyslog } = getConfig();
    logger = winston.createLogger({
      format: winston.format.simple(),
      transports: [
        new winston.transports.Console({
          format: stdFormat,
        }),
        ...(enableSyslog ? [
          new Syslog({
            app_name: LOGGER_CATEGORY,
            facility: 'user',
            protocol: 'unix',
            path: '/dev/log',
          }),
        ] : []),
      ],
      levels: winston.config.syslog.levels,
    });
  }

  return logger;
};

module.exports = getLogger;
