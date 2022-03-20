import * as React from 'react';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import { QueryClient, QueryClientProvider } from 'react-query';

import configureAppStore from 'src/store/configure-store';
import { initialState as initialStateSettings } from 'src/store/modules/settings';
import { getUserLocales } from 'src/modules/i18n';
import { getDefaultSettings } from 'src/modules/settings';
// for some reason, jest won't import correctly `message.ts`
import messages from 'locale/en/messages.json';

const locales = getUserLocales();
const settings = getDefaultSettings(locales);
const initialState = {
  settings: {
    ...initialStateSettings,
    settings,
  },
};

i18n.load('en', messages);
i18n.activate('en');

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
          <I18nProvider i18n={i18n}>
            <Provider store={store}>{children}</Provider>
          </I18nProvider>
        </StaticRouter>
      </QueryClientProvider>
    </div>
  );
}
