import * as React from 'react';
import { TabContext } from '../contexts/TabContext';

export function useCurrentTab() {
  const { getCurrentTab } = React.useContext(TabContext);

  return getCurrentTab();
}
