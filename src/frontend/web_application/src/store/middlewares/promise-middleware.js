export default (store) => (next) => (action) => {
  if (typeof action.then === 'function') {
    return action.then((resolved) => store.dispatch(resolved));
  }

  return next(action);
};
