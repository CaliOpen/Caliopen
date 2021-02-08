import configureMockStore from 'redux-mock-store';
import { getLastMessage } from './getLastMessage';
import promiseMiddleware from '../../../store/middlewares/promise-middleware';
import thunkMiddleware from '../../../store/middlewares/thunk-middleware';

const mockStore = configureMockStore([promiseMiddleware, thunkMiddleware]);
jest.mock('./fetchMessages', () => ({
  fetchMessages: (params) => (dispatch) => {
    dispatch({ type: 'FETCH_MESSAGES', payload: params });

    const lastMessageDate = new Date(2018, 1, 1);

    switch (params.discussion_id) {
      case '01':
        // the older is always the first
        return Promise.resolve([
          {
            message_id: 'd',
            discussion_id: '01',
            date_sort: lastMessageDate,
          },
          {
            message_id: 'c',
            discussion_id: '01',
            date_sort: new Date(lastMessageDate - 2 * 60 * 60 * 1000),
          },
        ]);
      default:
        return Promise.resolve([]);
    }
  },
}));

describe('message module - actions - getLastMessage', () => {
  it('getLastMessage from store', async () => {
    const now = new Date();
    const store = mockStore({
      message: {
        messagesCollections: {
          discussion: {
            '02': {
              messages: ['a', 'b'],
            },
          },
        },
        messagesById: {
          a: {
            message_id: 'a',
            discussion_id: '02',
            date_sort: new Date(now - 2 * 60 * 60 * 1000),
          },
          b: {
            message_id: 'b',
            discussion_id: '02',
            date_sort: now,
          },
        },
      },
    });

    const expectedActions = [];
    const action = getLastMessage({ discussionId: '02' });

    const result = await store.dispatch(action);
    expect(result).toEqual(store.getState().message.messagesById.b);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('getLastMessage from fetch', async () => {
    const now = new Date();
    const store = mockStore({
      message: {
        messagesCollections: {
          discussion: {
            '02': {
              messages: ['a', 'b'],
            },
          },
        },
        messagesById: {
          a: {
            message_id: 'a',
            discussion_id: '02',
            date_sort: new Date(now - 2 * 60 * 60 * 1000),
          },
          b: {
            message_id: 'b',
            discussion_id: '02',
            date_sort: now,
          },
        },
      },
    });

    const expectedActions = [
      {
        type: 'FETCH_MESSAGES',
        payload: { discussion_id: '01', is_draft: false, limit: 1 },
      },
    ];
    const action = getLastMessage({ discussionId: '01' });

    const result = await store.dispatch(action);
    const lastMessageDate = new Date(2018, 1, 1);
    expect(result).toEqual({
      message_id: 'd',
      discussion_id: '01',
      date_sort: lastMessageDate,
    });
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('getLastMessage has no lastMessage', async () => {
    const now = new Date();
    const store = mockStore({
      message: {
        messagesCollections: {
          discussion: {
            '02': {
              messages: ['a', 'b'],
            },
          },
        },
        messagesById: {
          a: {
            message_id: 'a',
            discussion_id: '02',
            date_sort: new Date(now - 2 * 60 * 60 * 1000),
          },
          b: {
            message_id: 'b',
            discussion_id: '02',
            date_sort: now,
          },
        },
      },
    });

    const expectedActions = [
      {
        type: 'FETCH_MESSAGES',
        payload: { discussion_id: '03', is_draft: false, limit: 1 },
      },
    ];
    const action = getLastMessage({ discussionId: '03' });

    const result = await store.dispatch(action);
    expect(result).toEqual(undefined);
    expect(store.getActions()).toEqual(expectedActions);
  });
});
