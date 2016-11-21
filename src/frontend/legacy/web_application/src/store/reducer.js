import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import notifyReducer from 'react-redux-notify';
import applicationReducer from './modules/application';
import userReducer from './modules/user';

const reducer = combineReducers({
  routing: routerReducer,
  notifications: notifyReducer,
  application: applicationReducer,
  user: userReducer,
});

export default reducer;
