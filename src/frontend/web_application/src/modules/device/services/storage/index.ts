import { getLocalstorage } from '../../../../services/localStorage';
import { CURVE_TYPE, HASH_NAME, CURVE_TYPE_ASSOC } from '../ecdsa';

const DEVICE_NAMESPACE = 'device';

let ls;
const getStorage = () => {
  if (!ls) {
    ls = getLocalstorage();
  }

  return ls;
};

export const saveConfig = ({ id, priv, hash, curve }) => {
  const storage = getStorage();
  storage.save(DEVICE_NAMESPACE, 'id', id);
  storage.save(DEVICE_NAMESPACE, 'priv', priv);
  storage.save(DEVICE_NAMESPACE, 'hash', hash);
  storage.save(DEVICE_NAMESPACE, 'curve', curve);
};

export const save = ({ id, keypair }) => {
  saveConfig({
    id,
    curve: CURVE_TYPE,
    hash: HASH_NAME,
    priv: keypair.priv.toString('hex'),
  });
};

export const getConfig = (): { [key: string]: string } | void => {
  const params = getStorage().findAll(DEVICE_NAMESPACE);

  if (!params.length) {
    return undefined;
  }

  return params.reduce(
    (acc, item) => ({
      ...acc,
      [item.id]: item.value,
    }),
    {}
  );
};

export interface PublicDevice {
  device_id: string;
  ecdsa_key: {
    curve: string;
    hash: string;
    x: string;
    y: string;
  };
}

// XXX: should be a "Model" ?
export const getPublicDevice = ({ id, keypair }): PublicDevice => {
  const pub = keypair.getPublic();

  return {
    device_id: id,
    ecdsa_key: {
      curve: CURVE_TYPE_ASSOC[CURVE_TYPE],
      hash: HASH_NAME,
      x: pub.getX().toString('hex'),
      y: pub.getY().toString('hex'),
    },
  };
};
