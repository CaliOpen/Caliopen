export const sortMessages = (messages, reversed) => messages.sort((a, b) => {
  if (reversed) {
    return new Date(b.date_sort) - new Date(a.date_sort);
  }

  return new Date(a.date_sort) - new Date(b.date_sort);
});

export const renderParticipant = participant => `${participant.label}` || `(${participant.address})`;

export const isParticipantUser = (participant, user) => {
  const isUserContactId = contactId => contactId === user.contact.contact_id;

  return (participant.contact_ids && participant.contact_ids.some(isUserContactId)) || false;
};

export const getLastMessage = messages => sortMessages(messages, true)[0];

export const getAuthor = message => message.participants && message.participants
  .find(participant => participant.type === 'From');

export const getRecipients = message => message.participants && message.participants
  .filter(participant => participant.type !== 'From');

export const getRecipientsExceptUser = (message, user) => getRecipients(message)
  .filter(participant => !isParticipantUser(participant, user));

export const isMessageFromUser = (message, user) => {
  const author = getAuthor(message);

  return isParticipantUser(author, user);
};

export const isUserRecipient = (message, user) => getRecipients(message)
  .some(recipient => isParticipantUser(recipient, user));
