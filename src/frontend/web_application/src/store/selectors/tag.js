import { createSelector } from 'reselect';

export const tagSelector = createSelector(
  [(state) => state.tag],
  (tagState) => tagState
);
