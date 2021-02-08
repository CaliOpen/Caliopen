import base64 from 'base64-js';
import SHA from 'jssha';
import { getKeypair, sign } from '../ecdsa';
import { getConfig } from '../storage';
import { buildURL } from '../../../routing';
import { readAsArrayBuffer } from '../../../file/services';
import UploadFileAsFormField from '../../../file/services/uploadFileAsFormField';

// see : https://jsperf.com/string-to-uint8array
const toByteArray = (str) => {
  const byteArray = new Uint8Array(str.length);

  for (let i = 0, j = str.length; i < j; i += 1) {
    byteArray[i] = str.charCodeAt(i);
  }

  return byteArray;
};

const buildMessage = async ({ method, url, params, data }) => {
  const sha256 = new SHA('SHA-256', 'ARRAYBUFFER');
  const methodBytes = toByteArray(method.toUpperCase());
  const builtURL = toByteArray(buildURL(url, params));

  sha256.update(methodBytes.buffer);
  sha256.update(builtURL.buffer);

  if (data instanceof UploadFileAsFormField) {
    const file = await readAsArrayBuffer(data.file);

    sha256.update(file);
  }

  if (data === Object(data)) {
    sha256.update(toByteArray(JSON.stringify(data)).buffer);
  }

  return sha256.getHash('HEX');
};

export const signRequest = async (req, privateKey) => {
  const message = await buildMessage(req);

  return base64.fromByteArray(sign(getKeypair(privateKey), message).toDER());
};

export const getSignatureHeaders = async (req, device) => {
  const { id, priv } = device || getConfig();
  const signature = await signRequest(req, priv);

  return {
    'X-Caliopen-Device-ID': id,
    'X-Caliopen-Device-Signature': signature,
  };
};
