import { configureStore } from '@reduxjs/toolkit';
import rootReducer, { RootState } from './reducer';
import axiosMiddleware from './middlewares/axios-middleware';
import encryptionMiddleware from './middlewares/encryption-middleware';
import decryptionMiddleware from './middlewares/decryption-middleware';
import contactMiddleware from './middlewares/contacts-middleware';
import discussionMiddleware from './middlewares/discussions-middleware';
import importanceLevelMiddleware from './middlewares/importance-level-middleware';
import messageMiddleware from './middlewares/messages-middleware';
import searchMiddleware from './middlewares/search-middleware';

const middlewares = [
  encryptionMiddleware,
  axiosMiddleware,
  decryptionMiddleware,
  contactMiddleware,
  discussionMiddleware,
  importanceLevelMiddleware,
  messageMiddleware,
  searchMiddleware,
];

function configureAppStore(preloadedState?: RootState) {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // prevent non serializable error on axios actions (only msw?)
        serializableCheck: false,
      }).prepend(...middlewares),
    preloadedState,
  });
}

export default configureAppStore;
