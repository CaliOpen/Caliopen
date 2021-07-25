export interface TagCommon {
  name: string;
  label: string;
}

export interface TagPayload extends TagCommon {
  type: 'system' | 'user';
}

export type TagAPIPostPayload = Omit<TagCommon, 'name'>
