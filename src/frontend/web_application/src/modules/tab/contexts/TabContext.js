import { createContext } from 'react';

export const TabContext = createContext({
  tabs: [],
  removeTab: () => {
    // noop
  },
});
