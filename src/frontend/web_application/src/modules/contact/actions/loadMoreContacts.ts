import { AppDispatch } from 'src/types';

import { getNextOffset, requestContacts } from '../store/reducer';

export const loadMoreContacts = () => (dispatch: AppDispatch, getState) => {
  const offset = getNextOffset(getState().contacts);

  return dispatch(requestContacts({ offset }));
};
