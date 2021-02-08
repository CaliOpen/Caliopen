import { fetchMessages as fetchMessagesBase } from '../../../store/modules/message';
import { tryCatchAxiosAction } from '../../../services/api-client';

// TODO: refactor in requestMessages cf. store/modules/message
export const fetchMessages = (...params) => async (dispatch) => {
  const { messages } = await tryCatchAxiosAction(() =>
    dispatch(fetchMessagesBase(...params))
  );

  return messages;
};
