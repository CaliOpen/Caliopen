// prevent circular reference between identity and draftMessage modules
import { getIdentityProtocol } from '../../draftMessage/services/getIdentityProtocol';
import { Participant } from '../../message';

export const identityToParticipant = ({ identity, user, type = 'From' }) => {
  const { identifier, display_name: label } = identity;
  const {
    contact: { contact_id: contactId },
  } = user;

  return new Participant({
    address: identifier,
    protocol: getIdentityProtocol(identity),
    label,
    type,
    contact_ids: [contactId],
  });
};
