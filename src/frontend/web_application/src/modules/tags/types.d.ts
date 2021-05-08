export interface TagCommon {
  name: string;
  label: string;
}

export interface TagPayload extends TagCommon {
  type: 'system' | 'user';
}

export interface TagAPIPostPayload extends Omit<TagCommon, 'name'> {}
