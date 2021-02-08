import {
  createDevice,
  updateDevice,
  invalidate,
} from '../../../store/modules/device';
import { tryCatchAxiosPromise } from '../../../services/api-client';

export const saveDevice = ({ device, original }) => async (dispatch) => {
  let result;

  if (!original) {
    result = await tryCatchAxiosPromise(dispatch(createDevice({ device })));
  } else {
    result = await tryCatchAxiosPromise(
      dispatch(updateDevice({ device, original }))
    );
  }
  dispatch(invalidate());

  return result;
};
