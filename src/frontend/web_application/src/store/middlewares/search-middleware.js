import { LOAD_MORE, search, getNextOffset } from '../modules/search';

const loadMoreHandler = ({ store, action }) => {
  if (action.type !== LOAD_MORE) {
    return;
  }

  const { term, doctype } = action.payload;
  const offset = getNextOffset(term, doctype, store.getState().search);

  store.dispatch(search({ term, doctype }, { offset }));
};

export default (store) => (next) => (action) => {
  const result = next(action);

  loadMoreHandler({ store, action });

  return result;
};
