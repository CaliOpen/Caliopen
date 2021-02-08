/**
 * Inspired by
 * https://raw.githubusercontent.com/buunguyen/redux-freeze/master/src/middleware.js
 */
import deepFreeze from 'deep-freeze-strict'; // eslint-disable-line import/no-extraneous-dependencies

function isFreezable(value) {
  return value !== null && typeof value === 'object';
}

function freezeStoreState(store) {
  const state = store.getState();
  if (isFreezable(state)) {
    deepFreeze(state);
  }
}

/**
 * Middleware that prevents state from being mutated anywhere in the app.
 */
export default function freezeState(store) {
  return (next) => (action) => {
    freezeStoreState(store);
    try {
      return next(action);
    } catch (err) {
      console.error('State may has mutated', err.stack); // eslint-disable-line no-console
    }

    freezeStoreState(store);

    return undefined;
  };
}
