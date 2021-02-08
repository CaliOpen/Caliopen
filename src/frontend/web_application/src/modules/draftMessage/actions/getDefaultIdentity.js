import { getIdentities } from '../../identity';
import { getIdentityProtocol } from '../services/getIdentityProtocol';

const isIdentityUsed = ({ participants, identity }) =>
  participants.some(
    (participant) =>
      participant.address === identity.identifier &&
      participant.protocol === getIdentityProtocol(identity)
  );

export const getDefaultIdentity = (
  { participants = undefined, protocol = 'email' } = { protocol: 'email' }
) => async (dispatch) => {
  const identities = await dispatch(getIdentities());

  if (!participants) {
    return [
      ...identities.sort((identity) => {
        if (identity.type === 'local') {
          return -1;
        }

        return 1;
      }),
    ].find((identity) => getIdentityProtocol(identity) === protocol);
  }

  return identities.reduce((acc, curr) => {
    if (getIdentityProtocol(curr) !== protocol) {
      return acc;
    }

    if (!acc) {
      return curr;
    }

    if (
      !isIdentityUsed({ participants, identity: acc }) &&
      isIdentityUsed({ participants, identity: curr })
    ) {
      return curr;
    }

    return acc;
  }, undefined);
};
