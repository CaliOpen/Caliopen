export interface TagPayload {
  type: 'system' | 'user';
  name: string;
  label: string;
}
export type NewTag = {
  label: string;
};

export type TagAPIPost = {
  parameters: {
    body: NewTag;
  };
};

export interface TagAPIGetList {
  response: {
    tags: TagPayload[];
    total: number;
  };
}

// Entity inheritance
export type EntityType = 'contact' | 'discussion' | 'message';

export interface Entity {
  tags?: string[];
}
