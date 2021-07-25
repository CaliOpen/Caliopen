export const [PUBLIC_KEY, PRIVATE_KEY] = ['public', 'private'];

const getKeyring = async () => {
  const { Keyring } = await import(/* webpackChunkName: "openpgp" */ 'openpgp');

  return new Keyring();
};

const loadKeyring = async () => {
  const keyring = await getKeyring();

  await keyring.load();

  return keyring;
};

const getKeyIdsForMessage = async ({ body }) => {
  const openpgp = await import(/* webpackChunkName: "openpgp" */ 'openpgp');
  const encryptedMessage = await openpgp.message.readArmored(body);
  const keyIds = encryptedMessage.getEncryptionKeyIds();

  return keyIds;
};

export const getKeysForMessage = async (message) => {
  const keyring = await loadKeyring();
  const keyIds = await getKeyIdsForMessage(message);

  return keyIds.reduce((acc, keyId) => {
    const keys = keyring.privateKeys.getForId(keyId.toHex(), true);

    return keys ? [...acc, keys] : acc;
  }, []);
};

export async function getPrimaryKeysByFingerprint() {
  const keyring = await loadKeyring();

  return keyring.getAllKeys().reduce((acc, key) => {
    const fingerprint = key.getFingerprint();
    const keyType = key.isPublic() ? 'publicKeyArmored' : 'privateKeyArmored';

    return {
      ...acc,
      [fingerprint]: {
        ...acc[fingerprint],
        [keyType]: key.armor(),
      },
    };
  }, {});
}

export async function getKeysForEmail(email, keyType = PUBLIC_KEY) {
  const keyring = await loadKeyring();

  if (keyType === PUBLIC_KEY) {
    return keyring.publicKeys.getForAddress(email);
  }

  if (keyType === PRIVATE_KEY) {
    return keyring.privateKeys.getForAddress(email);
  }

  throw new Error('keyType must be either PUBLIC_KEY or PRIVATE_KEY');
}

export async function saveKey(publicKeyArmored, privateKeyArmored) {
  const keyring = await loadKeyring();

  await keyring.publicKeys.importKey(publicKeyArmored);
  await keyring.privateKeys.importKey(privateKeyArmored);

  const error = await keyring.store();

  if (error) {
    throw new Error(error);
  }

  return undefined;
}

export async function deleteKey(fingerprint) {
  const keyring = await loadKeyring();

  keyring.removeKeysForId(fingerprint);
  const error = await keyring.store();

  return error;
}
