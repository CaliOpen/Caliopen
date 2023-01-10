import { RootState } from 'src/store/reducer';
import { TagState } from './reducer';

/**
 * @deprecated
 */
export const stateSelector = (state: RootState): TagState => state.tag;

/**
 * @deprecated
 */
export const shouldFetchSelector = (state: RootState) =>
  ['idle', 'invalidated'].includes(stateSelector(state).status);
