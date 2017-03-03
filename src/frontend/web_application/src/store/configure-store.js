import { createStore, applyMiddleware } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import { browserHistory } from 'react-router';
import rootReducer from './reducer';
import axiosMiddleware from './middlewares/axios-middleware';
import promiseMiddleware from './middlewares/promise-middleware';
import tagsMiddleware from './middlewares/tags-middleware';
import thunkMiddleware from './middlewares/thunk-middleware';

const middlewares = [
  routerMiddleware(browserHistory),
  axiosMiddleware,
  promiseMiddleware,
  tagsMiddleware,
  thunkMiddleware,
];

if (CALIOPEN_ENV === 'development' || CALIOPEN_ENV === 'staging') {
  middlewares.push(require('./middlewares/crash-reporter-middleware').default); // eslint-disable-line
  middlewares.push(require('./middlewares/freeze').default); // eslint-disable-line
}

if (BUILD_TARGET === 'browser') {
  middlewares.push(require('./middlewares/openpgp-middleware').default); // eslint-disable-line
}

const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);

function configureStore(initialState, extension) {
  return createStoreWithMiddleware(rootReducer, initialState, extension);
}

export default configureStore;
