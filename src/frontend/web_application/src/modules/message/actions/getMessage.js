import { requestMessage } from '../../../store/modules/message';
import { messagesByIdSelector } from '../../../store/selectors/message';
import { handleAxiosPromise } from '../../../services/api-client';

export const getMessage =
  ({ messageId }) =>
  async (dispatch, getState) => {
    const message = messagesByIdSelector(getState())[messageId];

    if (message) {
      return message;
    }

    await handleAxiosPromise(dispatch(requestMessage(messageId)));

    return messagesByIdSelector(getState())[messageId];
  };
