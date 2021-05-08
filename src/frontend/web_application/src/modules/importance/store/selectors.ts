import { RootState } from 'src/store/reducer';

export const importanceLevelSelector = (state: RootState) =>
  state.importanceLevel.range;
