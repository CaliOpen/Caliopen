import {
  deleteTag as deleteTagBase,
  invalidate,
} from '../../../../store/modules/tag';
import { tryCatchAxiosPromise } from '../../../../services/api-client';

export const deleteTag = ({ tag }) => async (dispatch) => {
  const result = tryCatchAxiosPromise(dispatch(deleteTagBase({ tag })));
  dispatch(invalidate());

  return result;
};
