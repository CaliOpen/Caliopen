import { matchPath } from 'react-router-dom';

export class Tab {
  constructor({ location, scrollY = 0 }) {
    this.location = location;
    this.scrollY = scrollY;
  }

  getMatch = ({ routeConfig }) =>
    matchPath(this.location.pathname, routeConfig);
}
