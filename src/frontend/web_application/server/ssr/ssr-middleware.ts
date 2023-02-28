import * as React from 'react';
import { renderToString } from 'react-dom/server';
import DocumentTitle from 'react-document-title';
import serialize from 'serialize-javascript';
import locale from 'locale';

import { RootState } from 'src/store/reducer';
import Bootstrap from './components/Bootstrap';
import configureStore from '../../src/store/configure-store';
import { getUserLocales } from '../../src/modules/i18n';
import { getDefaultSettings } from '../../src/modules/settings';
import { initConfig } from '../../src/services/config';
// @ts-ignore
import template from '../../dist/server/template.html';
import { getConfig } from '../config';
import { initialState as initialStateSettings } from '../../src/store/modules/settings';
import { getLogger } from '../logger';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      user: any;
      USER_LOCALES: string[];
    }
  }
}

const logger = getLogger();
/**
 * base html template
 */
function getMarkup({ store, context, location }) {
  try {
    const { protocol, hostname, port, maxBodySize } = getConfig();
    const config = { protocol, hostname, port };
    initConfig(config);
    const hasSSR =
      process.env.HAS_SSR === undefined || process.env.HAS_SSR === 'true';
    const markup = !hasSSR
      ? ''
      : renderToString(
          React.createElement(Bootstrap, {
            context,
            location,
            store,
          })
        );
    const documentTitle = DocumentTitle.rewind();
    const initialState = store.getState();

    return [
      { key: '</title>', value: `${documentTitle}</title>` },
      {
        key: '</head>',
        value: `<script>window.__STORE__ = ${serialize(
          initialState
        )};window.__INSTANCE_CONFIG__ = ${serialize({
          hostname,
          maxBodySize,
        })}</script></head>`,
      },
      { key: '%MARKUP%', value: markup },
    ].reduce(
      (str, current) => str.replace(current.key, current.value),
      template
    );
  } catch (e) {
    logger.error('Unable to render markup:', e);

    throw e;
  }
}

function applyUserToGlobal(req) {
  global.user = req.user;
}

function applyUserLocaleToGlobal(req) {
  const locales = new locale.Locales(req.headers['accept-language']).toJSON();

  global.USER_LOCALES = locales.map((loc) => loc.code);
}

export default (req, res, next) => {
  applyUserToGlobal(req);
  applyUserLocaleToGlobal(req);
  const initialState: Partial<RootState> = {
    settings: {
      ...initialStateSettings,
      settings: getDefaultSettings(getUserLocales()),
    },
  };

  const store = configureStore(initialState);
  const context: { url?: string; action?: string } = {};

  const html = getMarkup({ store, location: req.url, context });

  if (context.url) {
    const status = context.action === 'PUSH' ? 302 : 301;
    res.writeHead(status, {
      Location: context.url,
    });
    res.end();
  } else {
    res.write(html);
    res.end();
  }
};
