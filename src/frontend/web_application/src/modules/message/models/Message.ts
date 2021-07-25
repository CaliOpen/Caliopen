/* eslint-disable max-classes-per-file,camelcase */
import { IDraftMessagePayload } from 'src/modules/message/types';
import { v4 as uuidv4 } from 'uuid';
import { Participant } from './Participant';

export class Message {
  constructor(props = {}) {
    Object.assign(this, props);
  }

  attachments?: Array<any>;

  body?: string;

  body_is_plain?: boolean;

  date: string;

  date_delete?: string;

  date_insert: string;

  date_sort?: string;

  discussion_id: string;

  external_references?: any;

  excerpt?: string;

  user_identities?: Array<string>;

  importance_level?: number;

  is_answered: boolean;

  is_draft: boolean;

  is_unread: boolean;

  is_received?: boolean;

  message_id: string = uuidv4();

  parent_id?: string;

  participants: Array<Participant> = [];

  raw_msg_id: string;

  subject?: string = '';

  tags?: Array<string> = [];

  protocol: string;

  user_id: string;
}

export class NewMessage implements IDraftMessagePayload {
  constructor(props = {}) {
    Object.assign(this, props);
  }

  message_id?: string = uuidv4();

  subject?: string;

  body?: string;

  parent_id?: string;

  user_identities: Array<string>;

  tags?: Array<string>;

  participants?: Array<Participant>;
}
