// @deprecated, routes & tabs are not managed by redux anymore
import { createSelector } from 'reselect';
import { matchPath } from 'react-router-dom';

export const currentTabSelector = createSelector(
  [
    (state) => state.tab.tabs,
    (state) => state.router.location && state.router.location.pathname,
  ],
  (tabs, pathname) =>
    tabs.find((tab) => matchPath(pathname, { path: tab.pathname, exact: true }))
);
