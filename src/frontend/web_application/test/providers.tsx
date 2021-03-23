import * as React from 'react';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';

import configureAppStore from 'src/store/configure-store';
import { initialState as initialStateSettings } from 'src/store/modules/settings';
import { getUserLocales } from 'src/modules/i18n';
import { getDefaultSettings } from 'src/modules/settings';

const locales = getUserLocales();
const settings = getDefaultSettings(locales);
const initialState = {
  settings: {
    ...initialStateSettings,
    settings,
  },
};

export function AllProviders({ children }: { children: React.ReactNode }) {
  const store = configureAppStore(initialState);
  return (
    // id=root required for modals
    <div id="root">
      <StaticRouter>
        <Provider store={store}>{children}</Provider>
      </StaticRouter>
    </div>
  );
}
