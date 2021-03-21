import { configureStore, ConfigureStoreOptions } from '@reduxjs/toolkit';
import { queryMiddleware } from 'redux-query';
import superagentInterface from 'redux-query-interface-superagent';
import rootReducer, { RootState } from './reducer';
import axiosMiddleware from './middlewares/axios-middleware';
import encryptionMiddleware from './middlewares/encryption-middleware';
import decryptionMiddleware from './middlewares/decryption-middleware';
import discussionMiddleware from './middlewares/discussions-middleware';
import importanceLevelMiddleware from './middlewares/importance-level-middleware';
import messageMiddleware from './middlewares/messages-middleware';
import searchMiddleware from './middlewares/search-middleware';

export const getQueries = (state) => state.queries;
export const getEntities = (state) => state.entities;

const middlewares = [
  encryptionMiddleware,
  axiosMiddleware,
  decryptionMiddleware,
  discussionMiddleware,
  importanceLevelMiddleware,
  messageMiddleware,
  searchMiddleware,
  queryMiddleware(superagentInterface, getQueries, getEntities),
];

type PreloadedState = ConfigureStoreOptions<RootState>['preloadedState'];

function configureAppStore(preloadedState?: PreloadedState) {
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
