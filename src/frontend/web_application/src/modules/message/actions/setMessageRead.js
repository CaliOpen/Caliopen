import { postActions, requestMessage } from '../../../store/modules/message';

export const setMessageRead = ({ message, isRead = true }) => async (
  dispatch
) => {
  const action = isRead ? 'set_read' : 'set_unread';

  await dispatch(postActions({ message, actions: [action] }));

  return dispatch(requestMessage(message.message_id));
};
