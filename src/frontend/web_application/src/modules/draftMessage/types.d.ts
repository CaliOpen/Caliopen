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

// XXX extend Participant?
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
  discussion_id?: string;
  recipients: Array<Recipient>;
  // FIXME: Keep a copy of participants because of a bug backend side: the indenty is duplicated (from and to in participant) in draft. So it defeats discussion id selection on advanced draft form
  participants: Array<Participant>;
  body: string;
  subject?: string;
  parent_id?: string;
  identity_id: string;
}
