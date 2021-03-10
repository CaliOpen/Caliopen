import { RootState } from 'src/store/reducer';

export const stateSelector = (state: RootState) => state.contact;

export const shouldFetchSelector = (state: RootState) =>
  ['idle', 'invalidated'].includes(stateSelector(state).status);
