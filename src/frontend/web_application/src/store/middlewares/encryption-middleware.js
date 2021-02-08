import { encryptMessage } from '../../modules/encryption';
import {
  CREATE_MESSAGE,
  UPDATE_MESSAGE,
  createMessage,
  updateMessage,
} from '../modules/message';

const modifyActionWithMessage = ({ action, message }) => {
  switch (action.type) {
    case CREATE_MESSAGE:
      return createMessage({ message });
    case UPDATE_MESSAGE:
      return updateMessage({ message, original: action.payload.original });
    default:
      throw new Error(`action type "${action.type}" is not supported`);
  }
};

export default (store) => (next) => async (action) => {
  if (![CREATE_MESSAGE, UPDATE_MESSAGE].includes(action.type)) {
    return next(action);
  }

  const { message } = action.payload;
  const encryptedMessage = await store.dispatch(encryptMessage({ message }));

  if (encryptedMessage) {
    return next(
      modifyActionWithMessage({
        action,
        message: {
          ...encryptedMessage,
          privacy_features: {
            ...encryptedMessage.privacy_features,
            message_encrypted: 'True',
            message_encryption_method: 'pgp',
          },
        },
      })
    );
  }

  return next(
    modifyActionWithMessage({
      action,
      message: {
        ...message,
        privacy_features: !message.privacy_features
          ? message.privacy_features
          : {
              ...message.privacy_features,
              message_encrypted: 'False',
            },
      },
    })
  );
};
