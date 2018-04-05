import { v4 as uuidv4 } from 'uuid';
import { push, replace } from 'react-router-redux';
import { REQUEST_NEW_DRAFT, REQUEST_NEW_DRAFT_SUCCESS, REQUEST_DRAFT, requestNewDraftSuccess, requestDraftSuccess } from '../modules/draft-message';
import { editDraft } from '../../modules/draftMessage';
import { REPLY_TO_MESSAGE, requestMessages } from '../modules/message';
import { requestLocalIdentities } from '../modules/local-identity';
import { updateTab } from '../modules/tab';

function getDefaultIdentities({ protocols, identities = [] }) {
  return identities.reduce((acc, identity) => {
    if (
      protocols.indexOf(identity.type) !== -1 &&
      acc.filter(ident => ident.type === identity.type).length === 0
    ) {
      acc.push(identity);
    }

    return acc;
  }, []);
}

const localIdentityToIdentity = ({ identifier, type }) => ({ identifier, type });

async function getNewDraft({
  discussionId, store, messageToAnswer, messageId = uuidv4(),
}) {
  await store.dispatch(requestLocalIdentities());
  const { localIdentities } = store.getState().localIdentity;

  const draft = {
    ...(messageToAnswer && messageToAnswer.subject ? {
      subject: messageToAnswer.subject,
      parent_id: messageToAnswer.message_id,
    } : {}),
    body: '',
    identities: getDefaultIdentities({ protocols: ['email'], identities: localIdentities })
      .map(localIdentityToIdentity),
    discussion_id: discussionId,
    message_id: messageId,
  };

  return draft;
}

const concretRequestDraft = async ({ store, internalId, discussionId }) => {
  await store.dispatch(requestMessages('discussion', discussionId, { discussion_id: discussionId }));

  const {
    message: {
      messagesById,
      messagesCollections: { discussion: { [discussionId]: { messages: messageIds } } },
    },
  } = store.getState();

  const messages = messageIds.map(id => messagesById[id]);

  const message = messages.find(item => item.is_draft)
    || await getNewDraft({ discussionId, store, messageToAnswer: messages[0] });

  return store.dispatch(requestDraftSuccess({ internalId, draft: message }));
};

function requestDraftHandler({ store, action }) {
  if (action.type !== REQUEST_DRAFT) {
    return undefined;
  }

  const { internalId, discussionId } = action.payload;

  return concretRequestDraft({ store, internalId, discussionId });
}

async function requestNewDraftHandler({ store, action }) {
  if (action.type !== REQUEST_NEW_DRAFT) {
    return;
  }

  const { internalId } = action.payload;
  const draft = await getNewDraft({ store });

  store.dispatch(requestNewDraftSuccess({ internalId, draft }));
}

const requestNewDraftSuccessHandler = ({ store, action }) => {
  if (action.type !== REQUEST_NEW_DRAFT_SUCCESS) {
    return;
  }
  const { router: { location: { pathname } }, tab: { tabs } } = store.getState();

  if (pathname !== '/compose') {
    return;
  }

  const original = tabs.find(tab => tab.pathname === pathname);
  const { internalId } = action.payload;
  const newPathname = `/compose/${internalId}`;
  const tab = { ...original, pathname: newPathname };
  store.dispatch(updateTab({ tab, original }));
  store.dispatch(replace(newPathname));
};

const draftSelector = (state, { internalId }) => state.draftMessage.draftsByInternalId[internalId];

const REPLY_HASH = 'reply';

const replyToMessageHandler = async ({ store, action }) => {
  if (action.type !== REPLY_TO_MESSAGE) {
    return undefined;
  }

  const { internalId, message: messageInReply } = action.payload;

  await concretRequestDraft({ store, discussionId: messageInReply.discussion_id, internalId });

  const state = store.getState();

  const draft = {
    ...draftSelector(state, { internalId }),
    parent_id: messageInReply.message_id,
  };
  const message = draft.message_id ? state.message.messagesById[draft.message_id] : undefined;
  const discussionPath = `/discussions/${messageInReply.discussion_id}#${REPLY_HASH}`;

  return Promise.all([
    store.dispatch(push(discussionPath)),
    store.dispatch(editDraft({ internalId, draft, message })),
  ]);
};

export default store => next => (action) => {
  const result = next(action);

  requestDraftHandler({ store, action });
  requestNewDraftHandler({ store, action });
  requestNewDraftSuccessHandler({ store, action });
  replyToMessageHandler({ store, action });

  return result;
};
