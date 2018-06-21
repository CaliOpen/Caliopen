import configureMockStore from 'redux-mock-store';
import promiseMiddleware from '../../../store/middlewares/promise-middleware';
import thunkMiddleware from '../../../store/middlewares/thunk-middleware';
import { requestDiscussionDraft } from './requestDiscussionDraft';
import { requestDraft, requestDraftSuccess, createDraft } from '../../../store/modules/draft-message';


const mockStore = configureMockStore([promiseMiddleware, thunkMiddleware]);
jest.mock('../../message', () => ({
  getDraft: ({ discussionId }) => (dispatch) => {
    dispatch({ type: 'getDraft', payload: { discussionId } });

    switch (discussionId) {
      case '01':
        return Promise.resolve({
          message_id: 'bar',
          discussion_id: '01',
          is_draft: true,
        });
      default:
        return Promise.resolve(undefined);
    }
  },
  getLastMessage: ({ discussionId }) => (dispatch) => {
    dispatch({ type: 'getLastMessage', payload: { discussionId } });

    switch (discussionId) {
      case '02':
        return Promise.resolve({
          message_id: 'last-msg',
          discussion_id: '01',
          subject: 'Parent msg subject',
          is_draft: false,
        });
      default:
        return Promise.resolve(undefined);
    }
  },
}));
jest.mock('../../identity', () => ({
  getLocalIdentities: () => (dispatch) => {
    dispatch({ type: 'getLocalIdentities', payload: { } });

    return Promise.resolve([]);
  },
}));

describe('modules draftMessage - actions - requestDiscussionDraft', () => {
  it('creates a new draft for a discussion without any messages', async () => {
    const store = mockStore({
      message: {
        messagesById: {},
      },
      draftMessage: {
        draftsByInternalId: {
        },
      },
    });
    const draft = {
      discussion_id: 'unknown',
      body: '',
      identities: [],
      parent_id: '',
      subject: '',
      message_id: expect.anything(),
    };

    const expectedActions = [
      requestDraft({ internalId: 'unknown' }),
      { type: 'getDraft', payload: { discussionId: 'unknown' } },
      { type: 'getLastMessage', payload: { discussionId: 'unknown' } },
      { type: 'getLocalIdentities', payload: { } },
      createDraft({ internalId: 'unknown', draft }),
      requestDraftSuccess({ internalId: 'unknown', draft }),
    ];
    const action = requestDiscussionDraft({ internalId: 'unknown', discussionId: 'unknown' });

    const result = await store.dispatch(action);
    expect(result).toEqual(draft);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('creates a new draft', async () => {
    const store = mockStore({
      message: {
        messagesById: {},
      },
      draftMessage: {
        draftsByInternalId: {
        },
      },
    });
    const draft = {
      discussion_id: '02',
      body: '',
      identities: [],
      parent_id: 'last-msg',
      subject: 'Parent msg subject',
      message_id: expect.anything(),
    };

    const expectedActions = [
      requestDraft({ internalId: '02' }),
      { type: 'getDraft', payload: { discussionId: '02' } },
      { type: 'getLastMessage', payload: { discussionId: '02' } },
      { type: 'getLocalIdentities', payload: { } },
      createDraft({ internalId: '02', draft }),
      requestDraftSuccess({ internalId: '02', draft }),
    ];
    const action = requestDiscussionDraft({ internalId: '02', discussionId: '02' });

    const result = await store.dispatch(action);
    expect(result).toEqual(draft);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('uses store', async () => {
    const draft = {
      message_id: 'bar',
      discussion_id: 'foo',
      is_draft: true,
    };

    const store = mockStore({
      message: {
        messagesById: {},
      },
      draftMessage: {
        draftsByInternalId: {
          foo: draft,
        },
      },
    });

    const expectedActions = [];
    const action = requestDiscussionDraft({ internalId: 'foo', discussionId: 'whatever' });

    const result = await store.dispatch(action);
    expect(result).toEqual(draft);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('fetch discussion with a result', async () => {
    const draft = {
      message_id: 'bar',
      discussion_id: '01',
      is_draft: true,
    };
    const store = mockStore({
      message: {
        messagesById: {},
      },
      draftMessage: {
        draftsByInternalId: {},
      },
    });

    const expectedActions = [
      requestDraft({ internalId: '01' }),
      { type: 'getDraft', payload: { discussionId: '01' } },
      requestDraftSuccess({ internalId: '01', draft }),
    ];
    const action = requestDiscussionDraft({ internalId: '01', discussionId: '01' });

    const result = await store.dispatch(action);
    expect(result).toEqual(draft);
    expect(store.getActions()).toEqual(expectedActions);
  });
});
