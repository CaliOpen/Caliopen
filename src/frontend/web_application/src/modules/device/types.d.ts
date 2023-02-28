export type STATUS_VERIFIED = 'verified';
export type STATUS_UNVERIFIED = 'unverified';

export interface Device {
  type: 'other' | string;
  name: string;
  device_id: string;
  status: STATUS_VERIFIED | STATUS_UNVERIFIED;
  user_agent: string;
}

export interface Config {
  id: string;
  curve: string;
  hash: string;
  priv: string;
}

export interface PublicDevice {
  device_id: string;
  ecdsa_key: {
    curve: string;
    hash: string;
    x: string;
    y: string;
  };
}
