import flatMap from 'lodash/flatMap';
import * as openPgpModule from 'openpgp';

import {
  ERROR_UNABLE_READ_PUBLIC_KEY,
  ERROR_UNABLE_READ_PRIVATE_KEY,
  ERROR_FINGERPRINTS_NOT_MATCH,
} from './errors';

const GENERATE_KEY_OPTIONS = {
  numBits: 4096,
};

export { openPgpModule as module };

// http://monsur.hossa.in/2012/07/20/utf-8-in-javascript.html
function encodeUTF8(str: string) {
  return unescape(encodeURIComponent(str));
}

// function decodeUTF8(str) {
//   return decodeURIComponent(escape(str));
// }

export function generateKey(name, email, passphrase, options = {}) {
  return openPgpModule.generateKey({
    ...GENERATE_KEY_OPTIONS,
    ...options,
    userIds: [{ name: encodeUTF8(name), email }],
    passphrase,
  });
}

export async function getKeyFromASCII(armored) {
  const { keys } = await openPgpModule.key.readArmored(armored);

  if (keys && keys.length) {
    return keys[0];
  }

  return undefined;
}

export async function encrypt({ content, recipientPubKeys }, key) {
  const keysList = await Promise.all(
    recipientPubKeys.map((pubkey) => openPgpModule.key.readArmored(pubkey))
  );
  const publicKeys = flatMap(keysList, ({ keys }) => keys);

  const options = {
    message: content,
    publicKeys,
    privateKeys: [key],
  };

  return openPgpModule.encrypt(options);
}

export async function decrypt({ content, authorPubKeys = [] }, key) {
  const keysList = await Promise.all(
    authorPubKeys.map((pubkey) => openPgpModule.key.readArmored(pubkey))
  );

  const publicKeys = flatMap(keysList, ({ keys }) => keys);
  const message = await openPgpModule.message.readArmored(content);

  const options = {
    message,
    publicKeys,
    privateKey: key,
  };

  openPgpModule.decrypt(options);
}

export async function validatePublicKeyChain(__, publicKeyArmored) {
  const publicKey = await getKeyFromASCII(publicKeyArmored);

  if (!publicKey) {
    return Promise.reject(ERROR_UNABLE_READ_PUBLIC_KEY);
  }

  return { key: publicKey, publicKeyArmored };
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
