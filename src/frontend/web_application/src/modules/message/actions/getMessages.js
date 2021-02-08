import { getMessage } from './getMessage';

export const getMessages = (messageids) => (dispatch) =>
  Promise.all(
    messageids.map((messageId) => dispatch(getMessage({ messageId })))
  );
