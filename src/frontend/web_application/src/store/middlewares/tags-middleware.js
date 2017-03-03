import { INVALIDATE_TAGS, CREATE_TAG_SUCCESS, requestTags, invalidate } from '../modules/tag';

export default store => next => (action) => {
  const result = next(action);

  if ([CREATE_TAG_SUCCESS].indexOf(action.type) !== -1) {
    store.dispatch(invalidate());
  }

  if (action.type === INVALIDATE_TAGS) {
    store.dispatch(requestTags());
  }

  return result;
};
