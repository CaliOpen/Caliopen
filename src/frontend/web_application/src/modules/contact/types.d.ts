// Entity ---------------------------------------
export interface ContactCommon {
  contact_id: string;
  title: string;
  family_name: string;
}

interface PrivacyIndex {
  technic: number;
  context: number;
  comportment: number;
}

interface Email {
  email_id: string;
  is_primary: number;
  date_update?: string;
  label?: string;
  address: string;
  type: string;
}
export interface ContactPayload extends ContactCommon {
  // FIXME: types are not yet verified
  addresses: string[];
  privacy_features: {};
  phones: string[];
  date_insert: string;
  identities: string[];
  user_id?: string;
  additional_name?: string;
  date_update?: string;
  organizations: string[];
  ims: string[];
  given_name: string;
  name_prefix?: string;
  deleted: number; // ?
  pi: PrivacyIndex;
  tags: string[];
  infos?: {
    birthday?: string;
  };
  emails: Email[];
  family_name: string;
  name_suffix?: string;
  avatar: string;
  public_keys: string[];
}
//  ---------------------------------------------

export type TSortDir = 'ASC' | 'DESC';
