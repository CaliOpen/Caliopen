import throttle from 'lodash.throttle';
import isEqual from 'lodash.isequal';
import { push, replace } from 'react-router-redux';
import { createNotification, NOTIFICATION_TYPE_ERROR } from 'react-redux-notify';
import { REQUEST_NEW_DRAFT, REQUEST_NEW_DRAFT_SUCCESS, REQUEST_DRAFT, EDIT_DRAFT, SAVE_DRAFT, SEND_DRAFT, requestNewDraftSuccess, requestDraftSuccess, syncDraft, clearDraft, editDraft } from '../modules/draft-message';
import { CREATE_MESSAGE_SUCCESS, UPDATE_MESSAGE_SUCCESS, POST_ACTIONS_SUCCESS, REPLY_TO_MESSAGE, requestMessages, requestMessage, createMessage, updateMessage, postActions } from '../modules/message';
import { requestLocalIdentities } from '../modules/local-identity';
import { removeTab, updateTab } from '../modules/tab';
import fetchLocation from '../../services/api-location';
import { getTranslator } from '../../services/i18n';

const UPDATE_WAIT_TIME = 5 * 1000;

const getMessageUpToDate = async ({ store, messageId }) => {
  await store.dispatch(requestMessage({ messageId }));

  return store.getState().message.messagesById[messageId];
};

const createDraft = async ({ internalId, draft, store }) => {
  const resultAction = await store.dispatch(createMessage({ message: draft }));

  if (resultAction.type === CREATE_MESSAGE_SUCCESS) {
    const { location } = resultAction.payload.data;
    const { data: message } = await fetchLocation(location);
    await store.dispatch(syncDraft({ internalId, draft: message }));

    return getMessageUpToDate({ store, messageId: message.message_id });
  }

  throw new Error(`Unexpected type ${resultAction.type} in createDraft`);
};

const updateDraft = async ({ internalId, draft, original, store }) => store.dispatch(updateMessage({
  message: draft, original,
})).then(() => getMessageUpToDate({ store, messageId: draft.message_id }))
.then(message =>
    Promise.resolve(store.dispatch(syncDraft({ internalId, draft: message }))).then(() => message))
.catch(() => {
  const { translate: __ } = getTranslator();
  const notification = {
    message: __('message.feedbak.update_fail'), // Unable to update, may be the message has been modified somewhere else
    type: NOTIFICATION_TYPE_ERROR,
    duration: 0,
    canDismiss: true,
  };

  store.dispatch(createNotification(notification));

  return Promise.reject(notification);
});

const createOrUpdateDraft = async ({ internalId, draft, store, original }) => {
  if (draft.message_id) {
    return updateDraft({ internalId, draft, original, store });
  }

  return createDraft({ internalId, draft, store });
};

let throttled;
const createThrottle = ({ store, action, callback = message => message }) => throttle(() => {
  throttled = undefined;
  const { draft, original, internalId } = action.payload;

  createOrUpdateDraft({ internalId, draft, store, original })
    .then(message => callback(message));
}, UPDATE_WAIT_TIME, { leading: false });

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

async function getNewDraft({ discussionId, store, messageToAnswer }) {
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

const saveDraftMiddleware = store => next => (action) => {
  if (action.type !== SAVE_DRAFT) {
    return next(action);
  }

  const { internalId, draft, original } = action.payload;

  return createOrUpdateDraft({ internalId, draft, store, original });
};

const editDraftHandler = ({ store, action }) => {
  if (action.type !== EDIT_DRAFT) {
    return;
  }
  throttled = createThrottle({ store, action });
  throttled();
};

const sendDraftMiddleware = store => next => (action) => {
  if (action.type !== SEND_DRAFT) {
    return next(action);
  }

  const { internalId, draft, original } = action.payload;
  const getMessage = async () => {
    if (isEqual(draft, original)) {
      return draft;
    }

    return createOrUpdateDraft({ internalId, draft, store, original });
  };

  return getMessage().then(async (message) => {
    const postActionsAction = await store.dispatch(postActions({ message, actions: ['send'] }));
    if (postActionsAction.type !== POST_ACTIONS_SUCCESS) {
      throw new Error('Fail to send');
    }

    if (store.getState().router.location.pathname === `/compose/${internalId}`) {
      store.dispatch(push(`/discussions/${message.discussion_id}`));
    }

    const tab = store.getState().tab.tabs
      .find(currentTab => currentTab.pathname === `/compose/${internalId}`);

    if (tab) {
      store.dispatch(removeTab(tab));
    }

    store.dispatch(clearDraft({ internalId }));
  });
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
  if ([EDIT_DRAFT, SAVE_DRAFT].indexOf(action.type) !== -1 && throttled) {
    throttled.cancel();
  }

  if ([CREATE_MESSAGE_SUCCESS, UPDATE_MESSAGE_SUCCESS].indexOf(action.type) !== -1 && throttled) {
    throttled.cancel();
    throttled = undefined;
  }

  const result = next(action);

  editDraftHandler({ store, action });
  requestDraftHandler({ store, action });
  requestNewDraftHandler({ store, action });
  requestNewDraftSuccessHandler({ store, action });
  replyToMessageHandler({ store, action });

  return result;
};

export const middlewares = [
  saveDraftMiddleware,
  sendDraftMiddleware,
];
