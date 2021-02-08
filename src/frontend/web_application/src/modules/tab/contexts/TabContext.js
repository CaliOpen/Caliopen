import { createContext } from 'react';

export const TabContext = createContext({
  tabs: [],
  removeTab: ({ tab }) => {
    // noop
  },
  updateTab: () => {
    // noop
  },
  getCurrentTab: () => {
    // noop
  },
});
