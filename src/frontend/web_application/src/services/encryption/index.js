import { getPlainTextFromMime, mimeEncapsulate } from '../mime';

export const [ERROR_NEED_PASSPHRASE, ERROR_WRONG_PASSPHRASE] = [
  'error_need_passphrase',
  'error_wrong_passphrase',
];

const DEFAULT_KEY_OPTIONS = { numBits: 4096 };

const prepareKeys = async (openpgp, armoredKeys) => {
  const disarmoredKeys = await Promise.all(
    armoredKeys.map((armoredKey) =>
      openpgp.key.readArmored(armoredKey.key || armoredKey)
    )
  );

  return disarmoredKeys.reduce(
    (acc, disarmoredKey) => [...acc, ...disarmoredKey.keys],
    []
  );
};

export const isMessageEncrypted = (message) =>
  !!message.privacy_features &&
  message.privacy_features.message_encrypted === 'True' &&
  message.privacy_features.message_encryption_method === 'pgp';

export const encryptMessage = async (message, keys) => {
  const openpgp = await import(/* webpackChunkName: "openpgp" */ 'openpgp');

  if (keys.length === 0) return message;

  const mimeBody = mimeEncapsulate(message.body).toString();
  const options = {
    message: openpgp.message.fromText(mimeBody),
    publicKeys: await prepareKeys(openpgp, keys),
    privateKeys: null,
  };

  const { data: body } = await openpgp.encrypt(options);

  return { ...message, body };
};

export const decryptMessage = async (message, keys) => {
  if (!isMessageEncrypted(message)) return message;
  if (!message.user_identities) return message;

  const openpgp = await import(/* webpackChunkName: "openpgp" */ 'openpgp');

  const encryptedBody = await openpgp.message.readArmored(message.body);
  const options = {
    message: encryptedBody,
    privateKeys: keys,
    publicKeys: null,
  };

  const { data: body } = await openpgp.decrypt(options);
  const decryptedMessage = { ...message, body: getPlainTextFromMime({ body }) };

  return decryptedMessage;
};

export const generateKey = async (options) => {
  const openpgp = await import(/* webpackChunkName: "openpgp" */ 'openpgp');

  return openpgp.generateKey({ ...DEFAULT_KEY_OPTIONS, ...options });
};

export const getPublicKeyFromPrivateKey = async (
  privateKeyArmored,
  passphrase
) => {
  const openpgp = await import(/* webpackChunkName: "openpgp" */ 'openpgp');
  const {
    keys: [privateKey],
  } = await openpgp.key.readArmored(privateKeyArmored);

  if (!privateKey.isDecrypted()) {
    if (!passphrase) {
      throw new Error(ERROR_NEED_PASSPHRASE);
    }

    try {
      await privateKey.decrypt(passphrase);
    } catch (e) {
      throw new Error(ERROR_WRONG_PASSPHRASE);
    }
  }

  return privateKey.toPublic().armor();
};
