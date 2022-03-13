import { removeDevice, invalidate } from '../../../store/modules/device';
import { tryCatchAxiosPromise } from '../../../services/api-client';

export const revokeDevice =
  ({ device }) =>
  async (dispatch) => {
    const result = await tryCatchAxiosPromise(
      dispatch(removeDevice({ device }))
    );
    dispatch(invalidate());

    return result;
  };
