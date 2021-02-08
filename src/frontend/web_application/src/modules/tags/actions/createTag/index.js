import {
  createTag as createTagBase,
  invalidate,
} from '../../../../store/modules/tag';
import { tryCatchAxiosPromise } from '../../../../services/api-client';

export const createTag = (tag) => async (dispatch) => {
  const result = await tryCatchAxiosPromise(dispatch(createTagBase({ tag })));
  dispatch(invalidate());

  return result;
};
