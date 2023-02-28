import { ec as EC } from 'elliptic';

export const CURVE_TYPE = 'p256';
export const CURVE_TYPE_ASSOC = {
  p256: 'P-256',
};

// it depends on default props in curve p256 https://github.com/indutny/elliptic/blob/master/lib/elliptic/curves.js#L72-L79
export const HASH_NAME = 'SHA256';

let ec: EC;
const getEC = () => {
  if (!ec) {
    ec = new EC(CURVE_TYPE);
  }

  return ec;
};

export const generateKeypair = () => getEC().genKeyPair();
export const getKeypair = (priv: string) => getEC().keyFromPrivate(priv, 'hex');
export const sign = (keypair, hash) => keypair.sign(hash);
