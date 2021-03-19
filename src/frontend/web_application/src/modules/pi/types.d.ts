export interface PI {
  technic: number;
  context: number;
  comportment: number;
  version: number;
  // [additional: string]: any, // XXX: not sure how to type `additionalProperties`
}

export interface PrivacyFeature {
  [key: string]: any;
}
