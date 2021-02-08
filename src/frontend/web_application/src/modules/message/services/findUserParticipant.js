import { isUserParticipant } from './isUserParticipant';

export const findUserParticipant = ({ user, participants }) =>
  participants &&
  participants.find((participant) => isUserParticipant({ participant, user }));
