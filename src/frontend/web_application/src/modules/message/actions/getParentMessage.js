import { getMessage } from './getMessage';

export const getParentMessage = ({ message }) => (dispatch) => {
  if (!message.parent_id) {
    return undefined;
  }

  return dispatch(getMessage({ messageId: message.parent_id }));
};
