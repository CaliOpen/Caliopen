import configureMockStore from 'redux-mock-store';
import promiseMiddleware from '../../../store/middlewares/promise-middleware';
import thunkMiddleware from '../../../store/middlewares/thunk-middleware';
import { requestDraft } from './requestDraft';
import {
  requestDraft as requestDraftBase,
  requestDraftSuccess,
  createDraft,
} from '../../../store/modules/draft-message';

const mockStore = configureMockStore([promiseMiddleware, thunkMiddleware]);
const getStore = () =>
  mockStore({
    message: {
      messagesById: {},
    },
    draftMessage: {
      draftsByMessageId: {},
      user: {
        user: {
          contact: {
            contact_id: 'unused',
          },
        },
      },
    },
  });
jest.mock('../../user', () => ({
  getUser: () => (dispatch) => dispatch({ type: 'getUser', payload: {} }),
}));
jest.mock('../../../modules/message', () => {
  const actualModule = jest.requireActual('../../../modules/message');

  return {
    ...actualModule,
    getDraft: jest.fn(({ discussionId }) => (dispatch) => {
      dispatch({ type: 'getDraft', payload: { discussionId } });

      switch (discussionId) {
        case '01':
          return Promise.resolve({
            message_id: 'bar',
            is_draft: true,
          });
        default:
          return Promise.resolve(undefined);
      }
    }),
    getLastMessage: jest.fn(({ discussionId }) => (dispatch) => {
      dispatch({ type: 'getLastMessage', payload: { discussionId } });

      switch (discussionId) {
        case '02':
          return Promise.resolve({
            message_id: 'last-msg',
            discussion_id: '02',
            subject: 'Parent msg subject',
            is_draft: false,
            protocol: 'email',
            participants: [
              { address: 'to@bar.tld', type: 'To', protocol: 'email' },
              { address: 'me@example.tld', type: 'From', protocol: 'email' },
            ],
          });
        case '03':
          return Promise.resolve({
            message_id: 'twitter-msg',
            discussion_id: '03',
            is_draft: false,
            protocol: 'twitter',
            participants: [
              { address: 'me-twitter', type: 'To', protocol: 'twitter' },
              { address: 'From', type: 'From', protocol: 'twitter' },
            ],
          });
        default:
          return Promise.resolve(undefined);
      }
    }),
    getMessage: jest.fn(({ messageId }) => (dispatch) => {
      dispatch({ type: 'getMessage', payload: { messageId } });

      switch (messageId) {
        case 'saved':
          return Promise.resolve({
            message_id: messageId,
            body: 'saved draft',
            protocol: 'email',
          });
        case 'twitter-msg':
          return Promise.resolve({
            message_id: messageId,
            protocol: 'twitter',
          });
        default:
          return Promise.reject(undefined);
      }
    }),
  };
});
jest.mock('./getDefaultIdentity', () => ({
  getDefaultIdentity: ({ participants, protocol = 'email' } = {}) => (
    dispatch
  ) => {
    dispatch({
      type: 'getDefaultIdentity',
      payload: { participants, protocol },
    });

    if (protocol === 'twitter') {
      return Promise.resolve({
        identity_id: 'ident-twitter',
        identifier: 'me-twitter',
        protocol: 'twitter',
      });
    }

    return Promise.resolve({
      identity_id: 'ident-default-mail',
      identifier: 'me@example.tld',
      protocol: 'imap',
    });
  },
}));

describe('modules draftMessage - actions - requestDraft', () => {
  describe('new discussion', () => {
    it('creates a new draft', async () => {
      const store = getStore();
      const draft = {
        body: '',
        subject: '',
        user_identities: expect.anything(),
        message_id: 'whatever',
      };
      const expectedActions = [
        requestDraftBase({ internalId: 'unknown' }),
        { type: 'getMessage', payload: { messageId: 'whatever' } },
        { type: 'getDefaultIdentity', payload: { protocol: 'email' } },
        createDraft({ internalId: 'unknown', draft }),
        requestDraftSuccess({
          internalId: 'unknown',
          draft,
        }),
      ];
      const action = requestDraft({
        internalId: 'unknown',
        hasDiscussion: false,
        messageId: 'whatever',
      });

      const result = await store.dispatch(action);
      expect(result).toEqual(draft);
      expect(result.user_identities.length).toEqual(1);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('has default identity', async () => {
      const store = getStore();
      const action = requestDraft({
        internalId: 'unknown',
        hasDiscussion: false,
        messageId: 'whatever',
      });

      const result = await store.dispatch(action);
      expect(result.user_identities).toEqual(['ident-default-mail']);
    });

    it('fetch an existing draft', async () => {
      const store = getStore();
      const message = {
        message_id: 'saved',
        body: 'saved draft',
        protocol: 'email',
      };
      const expectedActions = [
        requestDraftBase({ internalId: 'saved' }),
        { type: 'getMessage', payload: { messageId: 'saved' } },
        requestDraftSuccess({
          internalId: 'saved',
          draft: message,
        }),
      ];
      const action = requestDraft({
        internalId: 'saved',
        hasDiscussion: false,
        messageId: 'saved',
      });

      const result = await store.dispatch(action);
      expect(result).toEqual(message);
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('existing discussion', () => {
    it('creates a new draft', async () => {
      const store = getStore();
      const draft = {
        discussion_id: '02',
        body: '',
        user_identities: expect.anything(),
        parent_id: 'last-msg',
        subject: 'Parent msg subject',
        message_id: expect.anything(),
        participants: [
          { address: 'to@bar.tld', type: 'To', protocol: 'email' },
          { address: 'me@example.tld', type: 'From', protocol: 'email' },
        ],
      };

      const expectedActions = [
        requestDraftBase({ internalId: '02' }),
        { type: 'getDraft', payload: { discussionId: '02' } },
        { type: 'getLastMessage', payload: { discussionId: '02' } },
        { type: 'getUser', payload: {} },
        {
          type: 'getDefaultIdentity',
          payload: {
            protocol: 'email',
            participants: [
              { address: 'to@bar.tld', type: 'To', protocol: 'email' },
              { address: 'me@example.tld', type: 'From', protocol: 'email' },
            ],
          },
        },
        createDraft({ internalId: '02', draft }),
        requestDraftSuccess({ internalId: '02', draft }),
      ];
      const action = requestDraft({ internalId: '02', hasDiscussion: true });

      const result = await store.dispatch(action);
      expect(result).toEqual(draft);
      expect(result.user_identities.length).toEqual(1);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('new twitter draft', async () => {
      const store = getStore();
      const draft = {
        discussion_id: '03',
        body: '',
        subject: '',
        user_identities: ['ident-twitter'],
        parent_id: 'twitter-msg',
        message_id: expect.anything(),
        participants: [
          // To and From has been inverted as expected
          { address: 'me-twitter', type: 'From', protocol: 'twitter' },
          { address: 'From', type: 'To', protocol: 'twitter' },
        ],
      };

      const expectedActions = [
        requestDraftBase({ internalId: '03' }),
        { type: 'getDraft', payload: { discussionId: '03' } },
        { type: 'getLastMessage', payload: { discussionId: '03' } },
        { type: 'getUser', payload: {} },
        {
          type: 'getDefaultIdentity',
          payload: {
            protocol: 'twitter',
            participants: [
              { address: 'me-twitter', type: 'To', protocol: 'twitter' },
              { address: 'From', type: 'From', protocol: 'twitter' },
            ],
          },
        },
        createDraft({ internalId: '03', draft }),
        requestDraftSuccess({ internalId: '03', draft }),
      ];
      const action = requestDraft({ internalId: '03', hasDiscussion: true });

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
          draftsByMessageId: {
            foo: draft,
          },
        },
      });

      const expectedActions = [];
      const action = requestDraft({ internalId: 'foo', hasDiscussion: true });

      const result = await store.dispatch(action);
      expect(result).toEqual(draft);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('fetch discussion with a result', async () => {
      const draft = {
        message_id: 'bar',
        is_draft: true,
      };
      const store = getStore();
      const expectedActions = [
        requestDraftBase({ internalId: '01' }),
        { type: 'getDraft', payload: { discussionId: '01' } },
        requestDraftSuccess({ internalId: '01', draft }),
      ];
      const action = requestDraft({ internalId: '01', hasDiscussion: true });

      const result = await store.dispatch(action);
      expect(result).toEqual(draft);
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
