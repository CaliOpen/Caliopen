import { v4 as uuidv4 } from 'uuid';
import { getLocalIdentities } from '../../identity';
import { createDraft } from '../../../store/modules/draft-message';

const getDefaultIdentities = ({ protocols, identities = [] }) => identities
  .reduce((acc, identity) => {
    if (
      protocols.indexOf(identity.type) !== -1 &&
      acc.filter(ident => ident.type === identity.type).length === 0
    ) {
      acc.push(identity);
    }

    return acc;
  }, []);

const localIdentityToIdentity = ({ identifier, type }) => ({ identifier, type });

export const newDraft = ({ internalId, draft: { body = '', message_id: messageId = uuidv4(), ...draftParams } = {} }) =>
  async (dispatch) => {
    const localIdentities = await dispatch(getLocalIdentities());

    const draft = {
      message_id: messageId,
      body,
      identities: getDefaultIdentities({ protocols: ['email'], identities: localIdentities })
        .map(localIdentityToIdentity),
      ...draftParams,
    };
    dispatch(createDraft({ internalId, draft }));

    return draft;
  };
