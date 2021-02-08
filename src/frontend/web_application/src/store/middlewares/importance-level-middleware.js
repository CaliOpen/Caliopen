import { SET_IMPORTANCE_LEVEL } from '../modules/importance-level';
import { invalidateAll } from '../modules/message';

const importanceLevelHandler = ({ store, action }) => {
  if (action.type !== SET_IMPORTANCE_LEVEL) {
    return;
  }

  store.dispatch(invalidateAll());
};

export default (store) => (next) => (action) => {
  const result = next(action);

  importanceLevelHandler({ store, action });

  return result;
};
