import { Participant } from '../message';

// export interface IDraftMessage extends Message {
//   // TODO: verify
//   user_identities: string[];
//   participants: {
//     address: string;
//     label?: string;
//     protocol: string;
//     type: 'To' | 'From';
//     contact_ids?: string[];
//   }[];
//   body: string;
//   subject?: string;
//   parent_id: void | string;
// }

export interface Recipient {
  address: string;
  label?: string;
  protocol: string;
  // XXX: without from?
  type: 'To' | 'Cc' | 'Bcc' | 'From' | 'Reply-To' | 'Sender';
  contact_ids?: string[];
}

export interface IDraftMessageFormData {
  message_id: string;
  // XXX: useful?
  // user_identities: string[];
  recipients: Array<Recipient>;
  body: string;
  subject?: string;
  parent_id?: string;
  identity_id: string;
}
