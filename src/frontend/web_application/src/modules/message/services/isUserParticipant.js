export const isUserParticipant = ({ participant, user }) => {
  const isUserContactId = (contactId) => contactId === user.contact.contact_id;

  return (
    (participant.contact_ids &&
      participant.contact_ids.some(isUserContactId)) ||
    false
  );
};
