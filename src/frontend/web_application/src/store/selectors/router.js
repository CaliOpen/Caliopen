import { createSelector } from 'reselect';
import { URLSearchParams } from 'universal-url';

export const locationSelector = state => state.router.location;
export const pathnameSelector = state => state.router.location && state.router.location.pathname;
export const paramsSelector = createSelector(
  [locationSelector],
  (location) => {
    if (!location || !location.search) {
      return undefined;
    }

    const paramsIterator = new URLSearchParams(location.search);

    return Array.from(paramsIterator).reduce((acc, keyVal) => ({
      ...acc,
      [keyVal[0]]: keyVal[1],
    }), {});
  }
);
