import { combineReducers } from 'redux';
import notifyReducer from 'react-redux-notify';
import { reducer as formReducer } from 'redux-form';
import { store as contactStore } from 'src/modules/contact';
import deviceReducer from './modules/device';
import discussionReducer from './modules/discussion';
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
import { store as userStore } from 'src/modules/user';
import publicKeyReducer from './modules/public-key';
import viewReducer from './modules/view';
import encryptionReducer from './modules/encryption';
import { tagsApi } from 'src/modules/tags/store';

const reducer = combineReducers({
  notifications: notifyReducer,
  contact: contactStore.reducer,
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
  user: userStore.reducer,
  form: formReducer,
  publicKey: publicKeyReducer,
  view: viewReducer,
  encryption: encryptionReducer,
  [tagsApi.reducerPath]: tagsApi.reducer,
});

export type RootState = ReturnType<typeof reducer>;

export default reducer;
