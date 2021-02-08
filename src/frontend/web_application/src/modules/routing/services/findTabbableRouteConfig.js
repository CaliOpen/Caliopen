import { matchPath } from 'react-router-dom';
import { flattenRouteConfig } from './flattenRouteConfig';

export const findTabbableRouteConfig = ({ pathname, routes }) =>
  flattenRouteConfig(routes).find(
    ({ tab, path, exact, strict }) =>
      !!tab && matchPath(pathname, { path, exact, strict })
  );
