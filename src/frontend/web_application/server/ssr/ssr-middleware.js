const React = require('react');
const ReactDOMServer = require('react-dom/server');
const Bootstrap = require('./components/Bootstrap').default;
const configureStore = require('../../src/store/configure-store').default;
const { getUserLocales } = require('../../src/services/i18n');
const { getDefaultSettings } = require('../../src/services/settings');
const template = require('../../dist/server/template.html');
const { getConfig } = require('../config');

/**
 * base html template
 */
function getMarkup({ store, context, location }) {
  try {
    const { protocol, hostname, port } = getConfig();
    const config = { protocol, hostname, port };
    const markup = ReactDOMServer.renderToString(
      React.createElement(Bootstrap, {
        context, location, store, config,
      }));

    const initialState = store.getState();

    return [
      { key: '</head>', value: `<script>window.__STORE__ = ${JSON.stringify(initialState)};</script></head>` },
      { key: '%MARKUP%', value: markup },
    ].reduce((str, current) => str.replace(current.key, current.value), template);
  } catch (e) {
    console.error('Unable to render markup:', e);

    throw e;
  }
}

function applyUserLocaleToGlobal(req) {
  global.USER_LOCALE = req.locale;
}

module.exports = (req, res) => {
  applyUserLocaleToGlobal(req);

  const locales = getUserLocales();
  const settings = getDefaultSettings(locales[0]);

  // XXX: prefetch
  const initialState = {
    settings: {
      settings,
    },
  };

  const store = configureStore(initialState);
  const context = {};

  const html = getMarkup({ store, location: req.url, context });

  if (context.url) {
    res.writeHead(301, {
      Location: context.url,
    });
    res.end();
  } else {
    res.write(html);
    res.end();
  }
};
