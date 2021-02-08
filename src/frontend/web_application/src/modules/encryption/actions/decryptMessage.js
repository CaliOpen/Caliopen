import {
  isMessageEncrypted,
  decryptMessage as decryptMessageConcret,
} from '../../../services/encryption';
import { getKeysForMessage } from '../../../services/openpgp-keychain-repository';
import {
  askPassphrase,
  needPassphrase,
  needPrivateKey,
  decryptMessage as decryptMessageStart,
  decryptMessageSuccess,
  decryptMessageFail,
} from '../../../store/modules/encryption';

const getKeyPassphrase = (state, fingerprint) => {
  const { privateKeysByFingerprint } = state.encryption;

  return (
    privateKeysByFingerprint[fingerprint] &&
    privateKeysByFingerprint[fingerprint].status === 'ok' &&
    privateKeysByFingerprint[fingerprint].passphrase
  );
};

// XXX: refactor this ASAP
export const decryptMessage = ({ message }) => async (dispatch, getState) => {
  if (!isMessageEncrypted(message)) {
    return message;
  }

  try {
    dispatch(decryptMessageStart({ message }));
    const keys = await getKeysForMessage(message);

    if (keys.length <= 0) {
      dispatch(needPrivateKey({ message }));

      return message;
    }

    let usableKey = keys.find((key) => key.isDecrypted());
    let passphrase = null;

    if (!usableKey) {
      const state = getState();
      usableKey = keys.find((key) =>
        getKeyPassphrase(state, key.getFingerprint())
      );

      if (usableKey) {
        passphrase = getKeyPassphrase(state, usableKey.getFingerprint());
        try {
          await usableKey.decrypt(passphrase);
        } catch (e) {
          dispatch(
            askPassphrase({
              fingerprint: usableKey.getFingerprint(),
              error: e.message,
            })
          );

          return message;
        }
      }
    }

    if (!usableKey) {
      keys.forEach((key) =>
        dispatch(askPassphrase({ fingerprint: key.getFingerprint() }))
      );
      dispatch(
        needPassphrase({
          message,
          fingerprints: keys.map((key) => key.getFingerprint()),
        })
      );

      return message;
    }

    const decryptedMessage = await decryptMessageConcret(message, [usableKey]);
    dispatch(decryptMessageSuccess({ message, decryptedMessage }));

    return decryptedMessage;
  } catch (e) {
    const { message: error } = e;

    dispatch(decryptMessageFail({ message, error }));

    return message;
  }
};
