import { deleteTag as deleteTagBase, invalidate } from '../../store/reducer';
import { tryCatchAxiosPromise } from '../../../../services/api-client';

export const deleteTag =
  ({ tag }) =>
  async (dispatch) => {
    const result = tryCatchAxiosPromise(dispatch(deleteTagBase({ tag })));
    dispatch(invalidate());

    return result;
  };
