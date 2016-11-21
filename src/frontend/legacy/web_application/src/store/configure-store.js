import { createStore, applyMiddleware } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import { browserHistory } from 'react-router';
import rootReducer from './reducer';

const middlewares = [
  routerMiddleware(browserHistory),
];

if (CALIOPEN_ENV === 'development' || CALIOPEN_ENV === 'staging') {
  middlewares.push(require('./middlewares/freeze').default); // eslint-disable-line
}

const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);

function configureStore(initialState, extension) {
  return createStoreWithMiddleware(rootReducer, initialState, extension);
}

export default configureStore;
