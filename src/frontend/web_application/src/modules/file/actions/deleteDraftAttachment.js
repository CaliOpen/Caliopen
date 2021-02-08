import {
  requestMessage,
  deleteAttachment,
} from '../../../store/modules/message';
import { tryCatchAxiosPromise } from '../../../services/api-client';

export const deleteDraftAttachment = ({ message, attachment }) => async (
  dispatch
) => {
  try {
    await tryCatchAxiosPromise(
      dispatch(deleteAttachment({ message, attachment }))
    );

    return tryCatchAxiosPromise(dispatch(requestMessage(message.message_id)));
  } catch (err) {
    return Promise.reject(err);
  }
};
