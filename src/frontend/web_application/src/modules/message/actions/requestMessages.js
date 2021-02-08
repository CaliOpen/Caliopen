import { requestMessages as requestMessagesBase } from '../../../store/modules/message';
import { tryCatchAxiosAction } from '../../../services/api-client';

// @deprecated: use fetchMessages instead or request collection directly
export const requestMessages = (...params) => (dispatch) =>
  tryCatchAxiosAction(() => dispatch(requestMessagesBase(...params)));
