import { fetchMessages } from '../../message';

export const requestMessages = ({ view }) => (dispatch) =>
  dispatch(fetchMessages(view.getRequestParams()));
