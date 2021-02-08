/* eslint-disable import/no-extraneous-dependencies, no-restricted-globals */
import '@babel/polyfill';
import { getUnsignedClient } from '../../../services/api-client';
import { getSignatureHeaders } from '../../device/services/signature';

const THROTTLE_DURATION = 40 * 1000;

class Poller {
  client = getUnsignedClient();

  intervalId = undefined;

  notificationFilters = {};

  installInterceptor = (device) => {
    if (this.interceptor) return;

    this.interceptor = this.client.interceptors.request.use(async (req) => {
      const signatureHeaders = await getSignatureHeaders(req, device);

      return {
        ...req,
        headers: {
          ...req.headers,
          ...signatureHeaders,
        },
      };
    });
  };

  stop = () => {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  };

  start = (device) => {
    self.postMessage({ status: 'active' });
    this.installInterceptor(device);
    this.intervalId = setInterval(async () => {
      try {
        const params = Object.keys(this.notificationFilters)
          .map((key) => `${key}=${this.notificationFilters[key]}`)
          .join('&');
        const queryString = params.length > 0 ? `?${params}` : '';
        const { data: results } = await this.client.get(
          `/api/v2/notifications${queryString}`
        );
        self.postMessage({ results });
      } catch (err) {
        if (err.response.status === 401) {
          this.stop();
          self.postMessage({ status: 'auth_lost' });

          return;
        }
        if (err.response.status >= 400) {
          this.stop();
          self.postMessage({ status: 'terminated' });

          return;
        }
        throw err;
      }
    }, THROTTLE_DURATION);
  };

  handleStart = (message) => {
    if (message.action === 'start') {
      this.start(message.device);
    }
  };

  handleStop = (message) => {
    if (message.action === 'stop') {
      this.stop();
    }
  };

  handleUpdateNotificationFilters = (message) => {
    if (message.action === 'updateFilters') {
      this.notificationFilters = message.filters;
    }
  };

  handleEvent = (event) => {
    this.handleStart(event.data);
    this.handleStop(event.data);
    this.handleUpdateNotificationFilters(event.data);
  };
}

const poller = new Poller();

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  poller.handleEvent(event);
});
