import { IDENTITY_TYPE_TWITTER, IDENTITY_TYPE_MASTODON } from '../../contact';
import { getIdentityProtocol } from './getIdentityProtocol';

const getParticipantsContactsExceptUser = ({ contacts, participants, user }) =>
  participants.reduce((acc, participant) => {
    if (!participant.contact_ids) {
      return acc;
    }

    const contactIds = participant.contact_ids.filter(
      (contactId) => contactId !== user.contact.contact_id
    );

    if (contactIds.length === 0) {
      return acc;
    }

    const participantContacts = contactIds
      .map((contactId) => contacts.find((ct) => ct.contact_id === contactId))
      // filter deleted contact that still present in recipients
      .filter((ct) => !!ct);

    return [...acc, ...participantContacts];
  }, []);

const getAvailableProtocolsForTheContact = ({ contact }) => {
  const protocols = [];
  if (contact.emails && contact.emails.length >= 1) {
    protocols.push('email');
  }

  if (
    contact.identities &&
    contact.identities.filter(
      (identity) => identity.type === IDENTITY_TYPE_TWITTER
    ).length >= 1
  ) {
    protocols.push('twitter');
  }

  if (
    contact.identities &&
    contact.identities.filter(
      (identity) => identity.type === IDENTITY_TYPE_MASTODON
    ).length >= 1
  ) {
    protocols.push('mastodon');
  }

  return protocols;
};

const getMessageProtocol = (message) => {
  const { protocol } = message;
  if (!protocol) {
    return 'email';
  }

  return message.protocol;
};

export const filterIdentities = ({
  identities,
  parentMessage,
  contacts,
  user,
}) => {
  if (!parentMessage) {
    return identities;
  }

  const participantsContacts = getParticipantsContactsExceptUser({
    contacts,
    participants: parentMessage.participants,
    user,
  });

  // in a discussion 1-to-n we allow to switch identity of the same protocol
  if (
    contacts.length === 0 ||
    parentMessage.participants.length >= 3 ||
    participantsContacts.length === 0 ||
    participantsContacts.length > 1
  ) {
    return identities.filter(
      (identity) =>
        getIdentityProtocol(identity) === getMessageProtocol(parentMessage)
    );
  }

  // in a discussion 1-to-1 we allow to switch identity of the protocol that the associated contact
  // can receive
  const [contact] = participantsContacts;
  const availableProtocols = getAvailableProtocolsForTheContact({ contact });

  return identities.filter((identity) =>
    availableProtocols.includes(getIdentityProtocol(identity))
  );
};
