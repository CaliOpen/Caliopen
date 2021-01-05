import { v4 as uuidv4 } from 'uuid';
import { Message, NewMessage, Participant } from 'src/modules/message';
import { IDraftMessagePayload } from 'src/modules/message/types';
import { IDraftMessageFormData, Recipient } from './types';
import { getParticipantsExceptUser } from 'src/services/message';

export class DraftMessageFormData implements IDraftMessageFormData {
  constructor(props: Partial<DraftMessageFormData> = {}) {
    Object.assign(this, props);
  }

  message_id: string = uuidv4();
  // discussion_id: string;
  subject?: string = '';
  body: string = '';
  parent_id?: string;
  // XXX: useful?
  // user_identities: string[] = [];
  recipients: Array<Recipient> = [];
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
  const { participants, user_identities, ...rest } = message;

  return new DraftMessageFormData({
    ...rest,
    recipients: participants.filter(
      (participant) => participant.type !== 'From'
    ),
    identity_id: user_identities?.[0] || '',
  });
}
export function mapParticipantToRecipient(participant: Participant): Recipient {
  return participant;
}

export function mapRecipientToParticipant(recipient: Recipient): Participant {
  return recipient;
}
