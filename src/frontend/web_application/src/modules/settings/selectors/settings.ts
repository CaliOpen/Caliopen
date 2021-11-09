import { RootState } from 'src/store/reducer';

export const settingsSelector = (state: RootState): RootState['settings'] =>
  state.settings;
