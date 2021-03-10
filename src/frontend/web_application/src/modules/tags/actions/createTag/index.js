import { createTag as createTagBase, invalidate } from '../../store/reducer';
import { tryCatchAxiosPromise } from '../../../../services/api-client';

export const createTag = (tag) => async (dispatch) => {
  const result = await tryCatchAxiosPromise(dispatch(createTagBase({ tag })));
  dispatch(invalidate());

  return result;
};
