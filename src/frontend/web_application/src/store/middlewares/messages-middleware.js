import { POST_ACTIONS_SUCCESS, requestMessage } from '../modules/message';


const postActionsHandler = ({ store, action }) => {
  if (action.type !== POST_ACTIONS_SUCCESS) {
    return;
  }

  const { meta: { previousAction: { payload: { message } } } } = action;
  store.dispatch(requestMessage({ messageId: message.message_id }));
};

export default store => next => (action) => {
  const result = next(action);

  postActionsHandler({ store, action });

  return result;
};
