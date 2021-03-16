import flatMap from 'lodash/flatMap';
import * as module from 'openpgp';

import {
  ERROR_UNABLE_READ_PUBLIC_KEY,
  ERROR_UNABLE_READ_PRIVATE_KEY,
  ERROR_FINGERPRINTS_NOT_MATCH,
} from './errors';

const GENERATE_KEY_OPTIONS = {
  numBits: 4096,
};

export { module };

// http://monsur.hossa.in/2012/07/20/utf-8-in-javascript.html
function encodeUTF8(str: string) {
  return unescape(encodeURIComponent(str));
}

// function decodeUTF8(str) {
//   return decodeURIComponent(escape(str));
// }

export function generateKey(name, email, passphrase, options = {}) {
  return module.generateKey({
    ...GENERATE_KEY_OPTIONS,
    ...options,
    userIds: [{ name: encodeUTF8(name), email }],
    passphrase,
  });
}

export async function getKeyFromASCII(armored) {
  const { keys } = await module.key.readArmored(armored);

  if (keys && keys.length) {
    return keys[0];
  }

  return undefined;
}

export async function encrypt({ content, recipientPubKeys }, key) {
  const keysList = await Promise.all(
    recipientPubKeys.map((pubkey) => module.key.readArmored(pubkey))
  );
  const publicKeys = flatMap(keysList, ({ keys }) => keys);

  const options = {
    message: content,
    publicKeys,
    privateKeys: [key],
  };

  return module.encrypt(options);
}

export async function decrypt({ content, authorPubKeys = [] }, key) {
  const keysList = await Promise.all(
    authorPubKeys.map((pubkey) => module.key.readArmored(pubkey))
  );

  const publicKeys = flatMap(keysList, ({ keys }) => keys);
  const message = await module.message.readArmored(content);

  const options = {
    message,
    publicKeys,
    privateKey: key,
  };

  module.decrypt(options);
}

export function validatePublicKeyChain(__, publicKeyArmored) {
  return new Promise((resolve, reject) => {
    const publicKey = getKeyFromASCII(publicKeyArmored);

    if (!publicKey) {
      return reject(ERROR_UNABLE_READ_PUBLIC_KEY);
    }

    return resolve({ key: publicKey, publicKeyArmored });
  });
}

interface ValidateKeyChainPairErrors {
  publicKeyArmored?: [typeof ERROR_UNABLE_READ_PUBLIC_KEY];
  privateKeyArmored?: [typeof ERROR_UNABLE_READ_PRIVATE_KEY];
  global?: [typeof ERROR_FINGERPRINTS_NOT_MATCH];
}
export async function validateKeyChainPair(
  publicKeyArmored,
  privateKeyArmored
) {
  const publicKey = await getKeyFromASCII(publicKeyArmored);
  const privateKey = await getKeyFromASCII(privateKeyArmored);

  const errors: ValidateKeyChainPairErrors = {};
  if (!publicKey) {
    errors.publicKeyArmored = [ERROR_UNABLE_READ_PUBLIC_KEY];
  }

  if (!privateKey) {
    errors.privateKeyArmored = [ERROR_UNABLE_READ_PRIVATE_KEY];
  }

  if (
    publicKey &&
    privateKey &&
    publicKey.primaryKey.getFingerprint() !==
      privateKey.primaryKey.getFingerprint()
  ) {
    errors.global = [ERROR_FINGERPRINTS_NOT_MATCH];
  }

  if (errors) {
    return Promise.reject(errors);
  }

  return { key: publicKey, publicKeyArmored, privateKeyArmored };
}
