import configureMockStore from 'redux-mock-store';
import { updateContactTags } from './updateContactTags';
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
      payload: { type, contact_id: entity.contact_id, tags, lazy },
    });

    return Promise.resolve({ ...entity, tags });
  },
}));
jest.mock('../../../store/modules/contact', () => ({
  invalidate: () => (dispatch) => {
    dispatch({ type: 'invalidate' });

    return Promise.resolve({
      payload: { data: { tags: [{ label: 'Foo', name: 'foo' }] } },
    });
  },
}));

const mockStore = configureMockStore([promiseMiddleware, thunkMiddleware]);

describe('modules tags - actions - updateContactTags', () => {
  it('updates tag collection for each contact then invalidate', () => {
    const store = mockStore({
      contact: {
        contactsById: {
          aabbcc01: {
            contact_id: 'aabbcc01',
            tags: [{ label: 'Foo', name: 'foo' }],
          },
          aabbcc02: {
            contact_id: 'aabbcc02',
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
        payload: { type: 'contact', contact_id: 'aabbcc01', lazy: true, tags },
      },
      {
        type: 'updateTagCollection',
        payload: { type: 'contact', contact_id: 'aabbcc02', lazy: true, tags },
      },
      { type: 'invalidate' },
    ];
    const action = updateContactTags(
      i18n,
      ['aabbcc01', 'aabbcc02'],
      tagCollection
    );

    return store.dispatch(action).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
