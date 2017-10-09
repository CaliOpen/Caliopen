import React from 'react';
import ReactDOM from 'react-dom';
import { ConnectedRouter } from 'react-router-redux';
import PiwikReactRouter from 'piwik-react-router';
import App from './App';
import configureStore from './store/configure-store';
import getRouterHistory from './services/router-history';
import { getUserLocales } from './services/i18n';
import { getDefaultSettings } from './services/settings';

const piwik = PiwikReactRouter({
  url: 'https://piwik.caliopen.org/analytics',
  siteId: 6,
});

let devTools;

if (CALIOPEN_ENV === 'development') {
  devTools = window.devToolsExtension && window.devToolsExtension();
}

const locales = getUserLocales();
const settings = getDefaultSettings(locales[0]);

const store = configureStore({
  settings: {
    settings,
  },
}, devTools);
const history = getRouterHistory();

const rootEl = document.getElementById('root');
ReactDOM.render(
  (
    <ConnectedRouter store={store} history={piwik.connectToHistory(history)}>
      <App store={store} />
    </ConnectedRouter>
  ),
  rootEl
);
