import { getLogger } from '../getLogger';
import { getConfig } from '../../config';

const logger = getLogger();
// real used port is in listener var wich is not available in req
const {
  webServer: { port },
} = getConfig();
const portStr = [80, 443].includes(port) ? '' : `:${port}`;

export const httpLog = (req, res, next) => {
  const { method, protocol, hostname, originalUrl } = req;

  res.on('finish', () => {
    const status = res.headersSent ? res.statusCode : '';
    logger.debug(
      `req: ${method} - ${protocol}://${hostname}${portStr}${originalUrl} - ${status}`
    );
  });
  next();
};
