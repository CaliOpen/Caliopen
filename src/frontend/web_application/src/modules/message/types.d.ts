import { Participant } from './models/Participant';
/**
 * cf. NewMessageV2.ymaml
 */
export interface IDraftMessagePayload {
  message_id?: string;
  subject?: string;
  body?: string;
  parent_id?: string;
  user_identities: Array<string>;
  tags?: Array<string>;
  participants?: Array<Participant>;
}
