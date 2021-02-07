import * as React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import PiwikReactRouter from 'piwik-react-router';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  install as PWAOfflineInstall,
  applyUpdate,
} from 'offline-plugin/runtime';
import App from './App';
import configureStore from './store/configure-store';
import { initialState as initialStateSettings } from './store/modules/settings';
import { getRouterHistory } from './modules/routing';
import { getUserLocales } from './modules/i18n';
import { getDefaultSettings } from './modules/settings';
import { getConfig } from './services/config';

let devTools;

if (CALIOPEN_ENV === 'development') {
  devTools =
    window.__REDUX_DEVTOOLS_EXTENSION__ &&
    window.__REDUX_DEVTOOLS_EXTENSION__({
      trace: true,
      traceLimit: 25,
    });
}

const locales = getUserLocales();
const settings = getDefaultSettings(locales);
const getHistory = () => {
  const history = getRouterHistory();
  const {
    piwik: { siteId },
  } = getConfig();
  if (siteId) {
    const piwik = PiwikReactRouter({
      url: 'https://piwik.caliopen.org/analytics',
      siteId,
    });

    return piwik.connectToHistory(history);
  }

  return history;
};

const store = configureStore(
  {
    settings: {
      ...initialStateSettings,
      settings,
    },
  },
  devTools
);

PWAOfflineInstall({
  onUpdateReady: () => {
    // Tells to new SW to take control immediately
    applyUpdate();
  },
});
const rootEl = document.getElementById('root');
ReactDOM.hydrate(
  <Router history={getHistory()}>
    <App store={store} />
  </Router>,
  rootEl
);
