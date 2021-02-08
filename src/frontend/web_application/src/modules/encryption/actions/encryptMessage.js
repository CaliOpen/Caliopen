import { identitiesSelector } from '../../identity';
import {
  getKeysForEmail,
  PUBLIC_KEY,
} from '../../../services/openpgp-keychain-repository';
import { getRecipientKeys } from './getRecipientKeys';
import { encryptMessage as encryptMessageConcret } from '../../../services/encryption';
import {
  encryptMessage as encryptMessageStart,
  encryptMessageSuccess,
  encryptMessageFail,
} from '../../../store/modules/encryption';

export const encryptMessage = ({ message }) => async (dispatch, getState) => {
  try {
    if (!message.user_identities || message.user_identities.length === 0) {
      throw new Error('identity is missing');
    }

    if (message.attachments) {
      throw new Error(
        'Encryption for message with attachments is not supported yet'
      );
    }

    const identity = identitiesSelector(getState()).find((curr) =>
      message.user_identities.includes(curr.identity_id)
    );

    // 1. we need to check all addresses to find keys.
    const [userKey, keys] = await Promise.all([
      getKeysForEmail(identity.identifier, PUBLIC_KEY),
      dispatch(getRecipientKeys({ message })),
    ]);

    if (!keys || keys.length === 0 || !userKey) {
      throw new Error('Keys are missing');
    }

    dispatch(encryptMessageStart({ message }));
    // 2. but there is no need for more than 1 key
    const encryptedMessage = await encryptMessageConcret(message, [
      userKey[0].armor(),
      ...keys,
    ]);

    dispatch(encryptMessageSuccess({ message, encryptedMessage }));

    return encryptedMessage;
  } catch (error) {
    dispatch(encryptMessageFail({ message, error: error.message || error }));

    return undefined;
  }
};
