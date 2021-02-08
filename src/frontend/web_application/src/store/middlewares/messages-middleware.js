import {
  LOAD_MORE_MESSAGES,
  requestMessages,
  getNextOffset,
} from '../modules/message';

const loadMoreHandler = ({ store, action }) => {
  if (action.type !== LOAD_MORE_MESSAGES) {
    return;
  }

  const { type, key } = action.payload;
  const collectionState = store.getState().message.messagesCollections[type][
    key
  ];
  const offset = getNextOffset(collectionState);
  const { params = {} } = collectionState.request;
  store.dispatch(requestMessages(type, key, { ...params, offset }));
};

export default (store) => (next) => (action) => {
  const result = next(action);

  loadMoreHandler({ store, action });

  return result;
};
