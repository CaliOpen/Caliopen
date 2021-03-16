import { RootState } from 'src/store/reducer';
import { TagState } from './reducer';

export const stateSelector = (state: RootState): TagState => state.tag;

export const shouldFetchSelector = (state: RootState) =>
  ['idle', 'invalidated'].includes(stateSelector(state).status);
