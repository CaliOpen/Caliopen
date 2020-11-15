import { combineReducers } from 'redux';
import notifyReducer from 'react-redux-notify';
import { reducer as formReducer } from 'redux-form';
import contactReducer from './modules/contact';
import deviceReducer from './modules/device';
import discussionReducer from './modules/discussion.ts';
import draftMessageReducer from './modules/draft-message';
import i18nReducer from './modules/i18n';
import importanceLevelReducer from './modules/importance-level';
import localIdentityReducer from './modules/local-identity';
import messageReducer from './modules/message';
import notificationReducer from './modules/notification';
import participantSuggestionsReducer from './modules/participant-suggestions';
import providerReducer from './modules/provider';
import remoteIdentityReducer from './modules/remote-identity';
import searchReducer from './modules/search';
import settingsReducer from './modules/settings';
import tagReducer from './modules/tag';
import userReducer from './modules/user';
import publicKeyReducer from './modules/public-key';
import viewReducer from './modules/view';
import encryptionReducer from './modules/encryption';

const reducer = combineReducers({
  notifications: notifyReducer,
  contact: contactReducer,
  device: deviceReducer,
  discussion: discussionReducer,
  draftMessage: draftMessageReducer,
  i18n: i18nReducer,
  importanceLevel: importanceLevelReducer,
  localIdentity: localIdentityReducer,
  message: messageReducer,
  notification: notificationReducer,
  participantSuggestions: participantSuggestionsReducer,
  provider: providerReducer,
  remoteIdentity: remoteIdentityReducer,
  search: searchReducer,
  settings: settingsReducer,
  tag: tagReducer,
  user: userReducer,
  form: formReducer,
  publicKey: publicKeyReducer,
  view: viewReducer,
  encryption: encryptionReducer,
});

export default reducer;
