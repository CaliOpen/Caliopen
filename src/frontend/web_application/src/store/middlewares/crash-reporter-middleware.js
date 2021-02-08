export default () => (next) => (action) => {
  try {
    return next(action);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Caught an exception!', err);

    throw err;
  }
};
