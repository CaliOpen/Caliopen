import { v4 as uuidv4 } from 'uuid';
import { Message, NewMessage, Participant } from 'src/modules/message';
import { IDraftMessagePayload } from 'src/modules/message/types';
import { IDraftMessageFormData, Recipient } from './types';

export class DraftMessageFormData implements IDraftMessageFormData {
  constructor(props: Partial<DraftMessageFormData> = {}) {
    Object.assign(this, props);
  }

  message_id: string = uuidv4();

  discussion_id?: string;

  subject?: string = '';

  body = '';

  parent_id?: string;

  recipients: Array<Recipient> = [];

  // FIXME: Keep a copy of participants because of a bug backend side: the indenty is duplicated (from and to in participant) in draft. So it defeats discussion id selection on advanced draft form
  participants: Array<Participant> = [];

  identity_id: string;
}

export function mapDraftMessageFormDataToMessage(
  formData: DraftMessageFormData
): IDraftMessagePayload {
  const { identity_id, recipients, ...rest } = formData;
  return new NewMessage({
    ...rest,
    participants: recipients.map(mapRecipientToParticipant),
    user_identities: [identity_id],
  });
}

export function mapMessageToDraftMessageFormData(
  message: Message
): DraftMessageFormData {
  const {
    message_id,
    discussion_id,
    subject,
    body,
    parent_id,
    participants,
    user_identities,
  } = message;

  return new DraftMessageFormData({
    message_id,
    discussion_id,
    subject,
    body,
    parent_id,
    recipients: participants.filter(
      (participant) => participant.type !== 'From'
    ),
    participants,
    identity_id: user_identities?.[0] || '',
  });
}
export function mapParticipantToRecipient(participant: Participant): Recipient {
  return participant;
}

export function mapRecipientToParticipant(recipient: Recipient): Participant {
  return recipient;
}
