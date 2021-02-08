import configureMockStore from 'redux-mock-store';
import { updateMessagesTags } from './updateMessagesTags';
import promiseMiddleware from '../../../store/middlewares/promise-middleware';
import thunkMiddleware from '../../../store/middlewares/thunk-middleware';

jest.mock('./updateTagCollection', () => ({
  updateTagCollection: (
    i18n,
    { type, entity, tags: tagCollection, lazy = false }
  ) => (dispatch) => {
    const tags = tagCollection.map((tag) => tag.name);
    dispatch({
      type: 'updateTagCollection',
      payload: { type, message_id: entity.message_id, tags, lazy },
    });

    return Promise.resolve({ ...entity, tags });
  },
}));
jest.mock('../../../store/modules/message', () => ({
  invalidateAll: () => (dispatch) => {
    dispatch({ type: 'invalidateAll' });

    return Promise.resolve({
      payload: { data: { tags: [{ label: 'Foo', name: 'foo' }] } },
    });
  },
}));

const mockStore = configureMockStore([promiseMiddleware, thunkMiddleware]);

describe('modules tags - actions - updateMessagesTags', () => {
  it('updates tag collection for each messages then invalidateAll', () => {
    const store = mockStore({
      message: {
        messagesById: {
          aabbcc01: {
            message_id: 'aabbcc01',
            tags: [{ label: 'Foo', name: 'foo' }],
          },
          aabbcc02: {
            message_id: 'aabbcc02',
            tags: [{ label: 'Foo', name: 'foo' }],
          },
        },
      },
      tag: {
        tags: [
          { label: 'Foo', name: 'foo' },
          { label: 'Bar', name: 'bar' },
        ],
      },
    });

    const i18n = { _: (id) => id };
    const tagCollection = [
      { label: 'Foo', name: 'foo' },
      { label: 'Bar' },
      { label: 'FooBar' },
    ];
    const tags = tagCollection.map((tag) => tag.name);
    const expectedActions = [
      {
        type: 'updateTagCollection',
        payload: { type: 'message', message_id: 'aabbcc01', lazy: true, tags },
      },
      {
        type: 'updateTagCollection',
        payload: { type: 'message', message_id: 'aabbcc02', lazy: true, tags },
      },
      { type: 'invalidateAll' },
    ];
    const action = updateMessagesTags(
      i18n,
      ['aabbcc01', 'aabbcc02'],
      tagCollection
    );

    return store.dispatch(action).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
