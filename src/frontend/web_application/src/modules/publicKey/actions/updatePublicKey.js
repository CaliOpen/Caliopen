import {
  requestPublicKeys,
  createPublicKey,
  updatePublicKey as updatePublicKeyBase,
} from '../../../store/modules/public-key';
import { tryCatchAxiosAction } from '../../../services/api-client';

const readArmored = async (armoredKey) => {
  const openpgp = await import(/* webpackChunkName: "openpgp" */ 'openpgp');

  return openpgp.key.readArmored(armoredKey);
};

export const updatePublicKey = (contact, publicKeyArmored) => async (
  dispatch
) => {
  const publicKey = await readArmored(publicKeyArmored);
  const keys = await tryCatchAxiosAction(() =>
    dispatch(requestPublicKeys({ contactId: contact.contact_id }))
  );
  const existingKey = keys.pubkeys.find(
    (key) =>
      key.fingerprint === publicKey.keys[0].getFingerprint().toUpperCase()
  );

  if (existingKey) {
    const publicKeyObject = {
      ...existingKey,
      key: publicKeyArmored,
    };

    return dispatch(
      updatePublicKeyBase({
        contactId: contact.contact_id,
        publicKeyObject,
        existingKey,
      })
    );
  }

  const publicKeyObject = {
    label: 'PGP', // Have a better default name idea ?
    key: publicKeyArmored,
  };

  return dispatch(
    createPublicKey({
      contactId: contact.contact_id,
      publicKey: publicKeyObject,
    })
  );
};
