import { getModuleStateSelector } from '../../../store/selectors/getModuleStateSelector';

export const isFetchingSelector = (state) =>
  getModuleStateSelector('discussion')(state).isFetching;
