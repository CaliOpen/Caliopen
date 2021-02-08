import React from 'react';
import ReactDOMServer from 'react-dom/server';
import DocumentTitle from 'react-document-title';
import serialize from 'serialize-javascript';
import locale from 'locale';
import Bootstrap from './components/Bootstrap';
import configureStore from '../../src/store/configure-store';
import { getUserLocales } from '../../src/modules/i18n';
import { getDefaultSettings } from '../../src/modules/settings';
import template from '../../dist/server/template.html';
import { getConfig } from '../config';
import { initialState as initialStateSettings } from '../../src/store/modules/settings';
import { getLogger } from '../logger';

const logger = getLogger();
/**
 * base html template
 */
function getMarkup({ store, context, location }) {
  try {
    const { protocol, hostname, port, maxBodySize } = getConfig();
    const config = { protocol, hostname, port };
    const hasSSR =
      process.env.HAS_SSR !== false && process.env.HAS_SSR !== 'false';
    const markup = !hasSSR
      ? ''
      : ReactDOMServer.renderToString(
          React.createElement(Bootstrap, {
            context,
            location,
            store,
            config,
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
  const initialState = {
    settings: {
      ...initialStateSettings,
      settings: getDefaultSettings(getUserLocales()),
    },
  };

  const store = configureStore(initialState);
  const context = {};

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
