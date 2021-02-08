import winston from 'winston';
import { Syslog } from 'winston-syslog';
import { getConfig } from '../config';

const LOGGER_CATEGORY = 'caliopen-frontend';
const stdFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.label({ label: LOGGER_CATEGORY }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level} ${info.label} - ${info.message}`
  )
);

let logger;

export const getLogger = () => {
  if (!logger) {
    const { enableSyslog } = getConfig();
    logger = winston.createLogger({
      level: process.env.NODE_ENV === 'development' ? 'info' : 'debug',
      format: winston.format.simple(),
      transports: [
        new winston.transports.Console({
          format: stdFormat,
        }),
        ...(enableSyslog
          ? [
              new Syslog({
                app_name: LOGGER_CATEGORY,
                facility: 'user',
                protocol: 'unix',
                path: '/dev/log',
              }),
            ]
          : []),
      ],
      levels: winston.config.syslog.levels,
    });
  }

  return logger;
};
