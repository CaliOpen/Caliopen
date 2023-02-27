import { combineReducers } from 'redux';
import notifyReducer from 'react-redux-notify';
import {
  TypedUseSelectorHook,
  useSelector as useSelectorBase,
} from 'react-redux';
import { reducer as formReducer } from 'redux-form';
import { store as contactStore } from 'src/modules/contact';
import { store as tagStore } from 'src/modules/tags';
import { store as userStore } from 'src/modules/user';
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
import publicKeyReducer from './modules/public-key';
import viewReducer from './modules/view';
import encryptionReducer from './modules/encryption';

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
  tag: tagStore.reducer,
  user: userStore.reducer,
  form: formReducer,
  publicKey: publicKeyReducer,
  view: viewReducer,
  encryption: encryptionReducer,
});

export type RootState = ReturnType<typeof reducer>;

export const useSelector: TypedUseSelectorHook<RootState> = useSelectorBase;

export default reducer;
