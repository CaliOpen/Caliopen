import { createSelector } from 'reselect';
import { hasMore } from '../modules/message';

export const messagesByIdSelector = (state) => state.message.messagesById;
export const collectionsSelector = (state) => state.message.messagesCollections;

export const createMessageCollectionStateSelector = (
  typeSelector,
  keySelector
) =>
  createSelector(
    [messagesByIdSelector, collectionsSelector, typeSelector, keySelector],
    (messagesById, collections, type, key) => {
      const collection =
        (collections[type] && collections[type][key]) || undefined;
      const messageIds = (collection && collection.messages) || [];
      const messages = messageIds.map((messageId) => messagesById[messageId]);

      return {
        messages,
        messageIds,
        didInvalidate: (collection && collection.didInvalidate) || false,
        hasMore: (collection !== undefined && hasMore(collection)) || false,
        isFetching: (collection && collection.isFetching) || false,
      };
    }
  );
