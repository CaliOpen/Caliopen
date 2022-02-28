import * as React from 'react';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import { I18nProvider } from '@lingui/react';
import { QueryClient, QueryClientProvider } from 'react-query';

import configureAppStore from 'src/store/configure-store';
import { initialState as initialStateSettings } from 'src/store/modules/settings';
import { getUserLocales } from 'src/modules/i18n';
import { getDefaultSettings } from 'src/modules/settings';

import catalog from '../locale/en/messages';

const locales = getUserLocales();
const settings = getDefaultSettings(locales);
const initialState = {
  settings: {
    ...initialStateSettings,
    settings,
  },
};
const catalogs = {
  en: catalog,
};

const queryClient = new QueryClient();

export function AllProviders({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement<React.HTMLAttributes<HTMLDivElement>> {
  const store = configureAppStore(initialState);

  return (
    // id=root required for modals
    <div id="root">
      <QueryClientProvider client={queryClient}>
        <StaticRouter>
          <I18nProvider language="en" catalogs={catalogs}>
            <Provider store={store}>{children}</Provider>
          </I18nProvider>
        </StaticRouter>
      </QueryClientProvider>
    </div>
  );
}
