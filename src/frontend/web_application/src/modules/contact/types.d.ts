import { PI, PrivacyFeature } from 'src/modules/pi/types';

// Entity ---------------------------------------
interface NewPostalAddress {
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

interface PostalAddress extends NewPostalAddress {
  address_id: string;
  city: string;
}

interface Email {
  email_id: string;
  is_primary: number;
  date_update?: string;
  label?: string;
  address: string;
  type: string;
}

interface NewSocialIdentity {
  infos?: { [key: string]: any };
  name: string;
  type: string;
}

interface SocialIdentity extends NewSocialIdentity {
  social_id: string;
}

interface NewOrganization {
  department?: string;
  is_primary?: boolean;
  job_description?: string;
  label?: string;
  name: string;
  title?: string;
  type?: string;
}

interface Organization extends NewOrganization {
  deleted?: boolean;
  organization_id: string;
}

interface NewPhone {
  is_primary?: boolean;
  number: string;
  type?: string;
  uri?: string;
}

interface Phone extends NewPhone {
  phone_id: string;
  normalized_number?: string;
}

interface NewIM {
  address: string;
  is_primary?: boolean;
  label?: string;
  protocol?: string;
  type?: string;
}

interface IM extends NewIM {
  im_id: string;
}

interface NewPublicKey {
  key: string; // description : "DER or PEM key, base64 encoded"
  label: string;
}

interface PublicKey extends NewPublicKey {
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

export interface ContactCommon {
  additional_name?: string;
  addresses?: PostalAddress[];
  avatar?: string;
  contact_id: string;
  date_insert?: string;
  date_update?: string;
  deleted?: string; // date-time
  emails?: Email[];
  family_name?: string;
  given_name?: string;
  groups?: string[];
  identities?: SocialIdentity[];
  ims?: IM[];
  infos?: {
    // object
    birthday?: string;
  };
  name_prefix?: string;
  name_suffix?: string;
  organizations?: Organization[];
  phones?: Phone[];
  pi?: PI;
  privacy_features?: PrivacyFeature;
  public_keys?: PublicKey[];
  tags?: string[];
  title?: string;
  user_id: string;
}

export type ContactPayload = ContactCommon
//  ---------------------------------------------

export type TSortDir = 'ASC' | 'DESC';
