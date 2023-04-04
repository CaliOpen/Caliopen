export interface PI {
  technic: number;
  context: number;
  comportment: number;
  version: number;
  // [additional: string]: any, // XXX: not sure how to type `additionalProperties`
}

export interface MessagePI {
  transport: number;
  social: number;
  content: number;
}

type PrivacyFeatureKey =
  | 'is_internal'
  | 'is_spam'
  | 'message_encrypted'
  | 'message_encrypted_method'
  | 'message_signed'
  | 'nb_external_hops'
  | 'spam_score'
  | 'transport_signed';

type PrivacyFeatureValue = 'False' | 'True' | string;

export interface PrivacyFeature {
  [key: PrivacyFeatureKey | string]: PrivacyFeatureValue;
}
