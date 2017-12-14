import React from 'react';
import ReactDOM from 'react-dom';
import { ConnectedRouter } from 'react-router-redux';
import PiwikReactRouter from 'piwik-react-router';
import App from './App';
import configureStore from './store/configure-store';
import getRouterHistory from './services/router-history';
import { getUserLocales } from './services/i18n';
import { getDefaultSettings } from './services/settings';
import { getConfig } from './services/config';

let devTools;

if (CALIOPEN_ENV === 'development') {
  devTools = window.devToolsExtension && window.devToolsExtension();
}

const locales = getUserLocales();
const settings = getDefaultSettings(locales[0]);
const getHistory = () => {
  const history = getRouterHistory();
  const { piwik: { siteId } } = getConfig();
  if (siteId) {
    const piwik = PiwikReactRouter({
      url: 'https://piwik.caliopen.org/analytics',
      siteId,
    });

    return piwik.connectToHistory(history);
  }

  return history;
};

const store = configureStore({
  settings: {
    settings,
  },
}, devTools);

const rootEl = document.getElementById('root');
ReactDOM.hydrate(
  (
    <ConnectedRouter store={store} history={getHistory()}>
      <App store={store} />
    </ConnectedRouter>
  ),
  rootEl
);
