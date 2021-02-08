import configureMockStore from 'redux-mock-store';
import { getDraft } from './getDraft';
import promiseMiddleware from '../../../store/middlewares/promise-middleware';
import thunkMiddleware from '../../../store/middlewares/thunk-middleware';

const mockStore = configureMockStore([promiseMiddleware, thunkMiddleware]);

describe('message module - actions - getDraft', () => {
  it('getDraft from store', async () => {
    const now = new Date();
    const store = mockStore({
      message: {
        messagesCollections: {
          discussion: {
            '02': {
              messages: ['a', 'b', 'c'],
            },
          },
        },
        messagesById: {
          a: {
            message_id: 'a',
            discussion_id: '02',
            date_sort: new Date(now.getTime() - 2 * 60 * 60 * 1000),
            is_draft: true,
          },
          b: {
            message_id: 'b',
            discussion_id: '02',
            date_sort: now,
            is_draft: true,
          },
          c: {
            message_id: 'c',
            discussion_id: '02',
            date_sort: now,
            is_draft: true,
          },
        },
      },
    });

    const expectedActions = [];
    const action = getDraft({ discussionId: '02' });

    const result = await store.dispatch(action);
    expect(result).toEqual(store.getState().message.messagesById.b);
    expect(store.getActions()).toEqual(expectedActions);
  });
});
