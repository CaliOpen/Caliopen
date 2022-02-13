import { PI, PrivacyFeature } from 'src/modules/pi/types';

// Entity ---------------------------------------
interface PostalAddressPayload {
  address_id?: string;
  city: string;
  country?: string;
  is_primary?: boolean;
  label?: string;
  postal_code?: string;
  region?: string;
  street?: string;
  type?: string;
}

interface PostalAddress extends PostalAddressPayload {
  address_id: string;
  city: string;
}

interface EmailPayload {
  address: string;
  type: string;
}
interface Email extends EmailPayload {
  email_id: string;
  is_primary: number;
  date_update?: string;
  label?: string;
}

interface SocialIdentityPayload {
  infos?: { [key: string]: any };
  name: string;
  type: string;
}

interface SocialIdentity extends SocialIdentityPayload {
  social_id: string;
}

interface OrganizationPayload {
  department?: string;
  is_primary?: boolean;
  job_description?: string;
  label?: string;
  name: string;
  title?: string;
  type?: string;
}

interface Organization extends OrganizationPayload {
  deleted?: boolean;
  organization_id: string;
}

interface PhonePayload {
  is_primary?: boolean;
  number: string;
  type?: string;
  uri?: string;
}

interface Phone extends PhonePayload {
  phone_id: string;
  normalized_number?: string;
}

interface IMPayload {
  address: string;
  is_primary?: boolean;
  label?: string;
  protocol?: string;
  type?: string;
}

interface IM extends IMPayload {
  im_id: string;
}

interface PublicKeyPayload {
  key: string; // description : "DER or PEM key, base64 encoded"
  label: string;
}

interface PublicKey extends PublicKeyPayload {
  alg?: string;
  crv?: string;
  date_insert?: string; // format: date-time
  date_update?: string; // format: date-time
  emails?: string[];
  expire_date?: string; // format: date-time
  fingerprint?: string;
  kty?: string;
  key_id: string;
  type?: string;
  resource_id: string;
  resource_type?: string;
  size?: number; // format: int32
  use?: string;
  user_id: string;
  x?: number; // format: int64
  y?: number; // format: int64
}

interface ContactCommon {
  additional_name?: string;
  avatar?: string;
  contact_id: string;
  date_insert?: string;
  date_update?: string;
  deleted?: string; // date-time
  family_name?: string;
  given_name?: string;
  groups?: string[];
  infos?: {
    // object
    birthday?: string;
  };
  name_prefix?: string;
  name_suffix?: string;
  tags?: string[];
  title?: string;
  user_id: string;
}

interface Contact extends ContactCommon {
  addresses?: PostalAddress[];
  avatar?: string;
  contact_id: string;
  date_insert?: string;
  date_update?: string;
  deleted?: string; // date-time
  emails?: Email[];
  identities?: SocialIdentity[];
  ims?: IM[];
  organizations?: Organization[];
  phones?: Phone[];
  pi?: PI;
  privacy_features?: PrivacyFeature;
  public_keys?: PublicKey[];
  user_id: string;
}

export interface ContactPayload extends ContactCommon {
  addresses?: PostalAddressPayload[];
  identities?: SocialIdentityPayload[];
  organizations?: OrganizationPayload[];
  emails?: EmailPayload[];
  phones?: PhonePayload[];
  ims?: IMPayload[];
}
//  ---------------------------------------------

export type TSortDir = 'ASC' | 'DESC';
