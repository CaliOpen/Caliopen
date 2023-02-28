import { v4 as uuidV4 } from 'uuid';
import { getLocalstorage } from '../../../../services/localStorage';
import { Config, PublicDevice } from '../../types';
import {
  CURVE_TYPE,
  HASH_NAME,
  CURVE_TYPE_ASSOC,
  getKeypair,
  generateKeypair,
} from '../ecdsa';

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

const configKeys = ['id', 'priv', 'hash', 'curve'];

export const getConfig = (): Config | void => {
  const params = getStorage().findAll(DEVICE_NAMESPACE);

  if (params.length !== configKeys.length) {
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

export function initConfig() {
  const id = uuidV4();
  const keypair = generateKeypair();

  saveConfig({
    id,
    curve: CURVE_TYPE,
    hash: HASH_NAME,
    // @ts-ignore: update lib?
    priv: keypair.priv.toString('hex'),
  });
}

export class ClientDevice {
  constructor(config: Config) {
    this.config = config;
    this.device_id = config.id;

    const keypair = getKeypair(config.priv);
    const pub = keypair.getPublic();

    this.ecdsa_key = {
      curve: CURVE_TYPE_ASSOC[CURVE_TYPE],
      hash: HASH_NAME,
      x: pub.getX().toString('hex'),
      y: pub.getY().toString('hex'),
    };
  }

  config: Config;

  device_id: string;

  ecdsa_key: {
    curve: string;
    hash: typeof HASH_NAME;
    x: string;
    y: string;
  };

  getPublic: () => PublicDevice = () => ({
    device_id: this.device_id,
    ecdsa_key: this.ecdsa_key,
  });
}
