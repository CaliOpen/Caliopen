import {
  getNextOffset,
  requestDiscussions,
  LOAD_MORE_DISCUSSIONS,
} from '../modules/discussion';

export default (store) => (next) => (action) => {
  const result = next(action);

  if (action.type === LOAD_MORE_DISCUSSIONS) {
    const offset = getNextOffset(store.getState().discussion);
    store.dispatch(requestDiscussions({ offset }));
  }

  return result;
};
