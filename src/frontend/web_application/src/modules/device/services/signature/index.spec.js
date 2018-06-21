import base64 from 'base64-js';
import { ec as EC } from 'elliptic';
import { getSignatureHeaders } from './';
import { CURVE_TYPE } from '../ecdsa';
import UploadFileAsFormField from '../../../file/services/uploadFileAsFormField';

jest.mock('../storage', () => ({
  getConfig: () => ({
    id: 'THIS-IS-NOT-A-DEVICE',
    priv: '841daea97dcd00713508fba1934d40116bffbb4004043d7071a41115122f911',
  }),
}));

describe('HTTP Request signature headers', () => {
  const ec = new EC(CURVE_TYPE);
  const publicKey = ec.keyFromPublic({
    x: 'a3e89871354b6abbf13feb497f7ea5fcbfacf8f74faf5a472c3c7f4de9eb1919',
    y: 'e8d3e5eaea22f57f1db50ebadd708b4618cf21bbaa023cc74e4de3d3e96723e6',
  });

  it('Creates a verifiable signature from URL', async () => {
    const req = { method: 'get', url: '/run/to/the/hills' };
    const hash = '11ef093b532721968d7d7f7123bf498379f9455695fc7ec4d8bf4d98ab230c3c';

    const signatureHeaders = await getSignatureHeaders(req);
    expect(signatureHeaders['X-Caliopen-Device-ID']).toEqual('THIS-IS-NOT-A-DEVICE');
    expect(publicKey.verify(hash, base64.toByteArray(signatureHeaders['X-Caliopen-Device-Signature']))).toBe(true);
  });

  it('Creates a signature from URL + params', async () => {
    const req = {
      method: 'get',
      url: '/run',
      params: {
        to: 'the hills',
        for: 'your life',
      },
    };
    const hash = '9119e04a31dbd4ec86a666e932e9d0102497e31bbff273e4802f08ad38a0b7f6';

    const signatureHeaders = await getSignatureHeaders(req);
    expect(signatureHeaders['X-Caliopen-Device-ID']).toEqual('THIS-IS-NOT-A-DEVICE');
    expect(publicKey.verify(hash, base64.toByteArray(signatureHeaders['X-Caliopen-Device-Signature']))).toBe(true);
  });

  it('Creates a signature from URL + file', async () => {
    const file = new UploadFileAsFormField(
      new Blob([0x004D, 0x0065, 0x0072, 0x0064, 0x0065, 0x0020, 0x001F, 0x0020, 0x0063,
        0x0065, 0x006C, 0x0075, 0x0069, 0x0020, 0x0071, 0x0075, 0x0069, 0x0020,
        0x006C, 0x0069, 0x0072, 0x0061, 0x002E]),
      'attachment'
    );
    const req = {
      method: 'post',
      url: '/run',
      data: file,
    };
    const hash = 'eca6dce65e7cd2f48d880700ebcfcbf1903be7891bc0750546e48217f9911c4a';

    const signatureHeaders = await getSignatureHeaders(req);
    expect(signatureHeaders['X-Caliopen-Device-ID']).toEqual('THIS-IS-NOT-A-DEVICE');
    expect(publicKey.verify(hash, base64.toByteArray(signatureHeaders['X-Caliopen-Device-Signature']))).toBe(true);
  });
});
