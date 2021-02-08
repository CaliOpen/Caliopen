import { Message } from 'src/modules/message';
import { IDraftMessagePayload } from 'src/modules/message/types';
import {
  DraftMessageFormData,
  mapMessageToDraftMessageFormData,
  mapParticipantToRecipient,
} from '../models';

export const calcSyncDraft = (
  draft: IDraftMessagePayload,
  message: Message
): DraftMessageFormData => {
  const nextDraft = mapMessageToDraftMessageFormData(message);
  const { body = '', subject, user_identities } = draft;

  const parentId = draft.parent_id || message.parent_id;

  return {
    ...nextDraft,
    body,
    subject,
    parent_id: parentId,
    recipients: message.participants
      .filter((participant) => participant.type !== 'From')
      .map(mapParticipantToRecipient),
    // FIXME
    identity_id: user_identities?.[0] || '',
  };
};
