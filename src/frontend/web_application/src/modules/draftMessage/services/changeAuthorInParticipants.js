import { getIdentityProtocol } from './getIdentityProtocol';

const isUserParticipant = ({ user, participant }) =>
  participant.contact_ids &&
  participant.contact_ids.includes(user?.contact.contact_id);

const isIdentityParticipant = ({ identity, participant }) =>
  identity.identifier === participant.address &&
  getIdentityProtocol(identity) === participant.protocol;

/**
 * 1. retrieve the identity used in participants
 * 2. or retrieve the participant associated to the user
 * 3. Set as author (it will be filtered in draft because we only want recipients)
 * 4. In case of no detections, a draft cannot be sent so all participants will be recipient
 * but it will have no effects
 */
export const changeAuthorInParticipants = ({
  participants,
  user,
  identity = undefined,
}) => {
  if (!participants) {
    return undefined;
  }

  const authorParticipant =
    (identity &&
      participants.find((participant) =>
        isIdentityParticipant({ identity, participant })
      )) ||
    participants.find((participant) =>
      isUserParticipant({ user, participant })
    );

  return participants.map((participant) => ({
    ...participant,
    type: participant === authorParticipant ? 'From' : 'To',
  }));
};
