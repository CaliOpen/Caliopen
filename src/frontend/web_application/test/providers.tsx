import * as React from 'react';
import { Provider } from 'react-redux';
import configureAppStore from '../src/store/configure-store';

const store = configureAppStore();

export function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Provider store={store}>{children}</Provider>
    </>
  );
}
