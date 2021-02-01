import * as React from 'react';
import { TabContext } from '../contexts/TabContext';

export function useCloseTab() {
  const { getCurrentTab, removeTab } = React.useContext(TabContext);

  function closeTab(tab?: any) {
    if (!tab) {
      return removeTab({ tab: getCurrentTab() });
    }

    return removeTab({ tab });
  }

  return closeTab;
}
