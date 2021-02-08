import base64 from 'base64-js';

export * from './utf8ArrayToString';

// see : https://jsperf.com/string-to-uint8array
export const toByteArray = (str) => {
  const byteArray = new Uint8Array(str.length);

  for (let i = 0, j = str.length; i < j; i += 1) {
    byteArray[i] = str.charCodeAt(i);
  }

  return byteArray;
};

export const strToBase64 = (str) => base64.fromByteArray(toByteArray(str));
