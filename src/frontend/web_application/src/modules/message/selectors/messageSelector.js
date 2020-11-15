import { getModuleStateSelector } from '../../../store/selectors/getModuleStateSelector';

export const messageSelector = (state, { messageId }) =>
  getModuleStateSelector('message')(state).messagesById[messageId];

// FIXME: isfetching, isLoaded …
export const shouldFetchSelector = (state, messageId) => {
  const message = messageSelector(state, { messageId });

  return !message;
};
