import { POST_ACTIONS_SUCCESS, LOAD_MORE_MESSAGES, requestMessage, requestMessages, getNextOffset } from '../modules/message';

const postActionsHandler = ({ store, action }) => {
  if (action.type !== POST_ACTIONS_SUCCESS) {
    return;
  }

  const { meta: { previousAction: { payload: { message } } } } = action;

  store.dispatch(requestMessage(message.message_id));
};

const loadMoreHandler = ({ store, action }) => {
  if (action.type !== LOAD_MORE_MESSAGES) {
    return;
  }

  const { type, key } = action.payload;
  const collectionState = store.getState().message.messagesCollections[type][key];
  const offset = getNextOffset(collectionState);
  const { params = {} } = collectionState.request;
  store.dispatch(requestMessages(type, key, { ...params, offset }));
};

export default store => next => (action) => {
  const result = next(action);

  postActionsHandler({ store, action });
  loadMoreHandler({ store, action });

  return result;
};
