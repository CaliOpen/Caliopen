import { RootState } from 'src/store/reducer';

export const userSelector = (state: RootState) => state.user.user;
