import configureMockStore from 'redux-mock-store';
import { getDefaultMiddleware } from '@reduxjs/toolkit';
import { updateTagCollection } from '.';

jest.mock('../createTag', () => ({
  createTag: ({ label }) => (dispatch) => {
    dispatch({ type: 'createTag', payload: { label } });

    return { label, name: label };
  },
}));
jest.mock('../requestTags', () => ({
  requestTags: () => (dispatch) => {
    dispatch({ type: 'requestTags' });

    return [
      { label: 'Foo', name: 'foo' },
      { label: 'Bar', name: 'bar' },
      { label: 'FooBar', name: 'foobar' },
    ];
  },
}));
jest.mock('../../../../store/modules/message', () => ({
  requestMessage: () => (dispatch) => {
    dispatch({ type: 'requestMessage' });

    return Promise.resolve({
      payload: { data: { tags: [{ label: 'Foo', name: 'foo' }] } },
    });
  },
  updateTags: ({ message, tags }) => (dispatch) => {
    dispatch({ type: 'updateTags', payload: { message, tags } });

    return Promise.resolve({ payload: { data: { location: 'foo' } } });
  },
}));

const mockStore = configureMockStore(getDefaultMiddleware());

describe('modules tags - actions - updateTagCollection', () => {
  it("create a new tag then patch message's tags", () => {
    const store = mockStore({
      tag: {
        tags: [
          { label: 'Foo', name: 'foo' },
          { label: 'Bar', name: 'bar' },
        ],
      },
    });

    const i18n = { _: (id) => id };
    const message = { tags: [{ label: 'Foo', name: 'foo' }] };
    const tags = [
      { label: 'Foo', name: 'foo' },
      { label: 'Bar' },
      { label: 'FooBar' },
    ];
    const expectedActions = [
      { type: 'createTag', payload: { label: 'FooBar' } },
      { type: 'requestTags' },
      {
        type: 'updateTags',
        payload: { message, tags: ['foo', 'bar', 'foobar'] },
      },
      { type: 'requestMessage' },
    ];
    const action = updateTagCollection(i18n, {
      type: 'message',
      entity: message,
      tags,
    });

    return store.dispatch(action).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
