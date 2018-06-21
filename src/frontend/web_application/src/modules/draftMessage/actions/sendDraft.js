import { postActions, requestMessage } from '../../../store/modules/message';

export const sendDraft = ({ draft: message }) => async (dispatch) => {
  await dispatch(postActions({ message, actions: ['send'] }));

  return dispatch(requestMessage(message.message_id));
};
