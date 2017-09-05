import reducer, * as module from './message';

describe('ducks module message', () => {
  describe('reducer', () => {
    it('reduces SYNC_MESSAGE', () => {
      const initialState = reducer(undefined, { type: '@@INIT' });
      const message = { body: 'foo', message_id: '111', discussion_id: 'a111' };
      expect(reducer(undefined, module.syncMessage({ message }))).toEqual({
        ...initialState,
        messagesById: {
          111: message,
        },
      });
    });

    describe('reduces REQUEST_MESSAGES_SUCCESS', () => {
      it('reduces without invalidateDiscussion', () => {
        const initialState = {
          ...reducer(undefined, { type: '@@INIT' }),
          messagesById: {
            a0: { body: 'already here', discussion_id: 'a', message_id: 'a0' },
          },
        };
        const message = { body: 'foo', message_id: 'a1', discussion_id: 'a' };
        const action = {
          type: module.REQUEST_MESSAGES_SUCCESS,
          payload: {
            data: {
              total: 1,
              messages: [message],
            },
          },
          meta: { previousAction: { type: module.REQUEST_MESSAGES, payload: { discussionId: 'a', request: { } } } },
        };
        expect(reducer(initialState, action)).toEqual({
          ...initialState,
          messagesById: {
            ...initialState.messagesById,
            a1: message,
          },
          total: 1,
        });
      });

      it('reduces with invalidateDiscussion', () => {
        const initialState = {
          ...reducer(undefined, { type: '@@INIT' }),
          didDiscussionInvalidate: { a: true },
          messagesById: {
            a0: { body: 'I am invalid', discussion_id: 'a', message_id: 'a0' },
          },
        };
        const message = { body: 'foo', message_id: 'a1', discussion_id: 'a' };
        const action = {
          type: module.REQUEST_MESSAGES_SUCCESS,
          payload: {
            data: {
              total: 1,
              messages: [message],
            },
          },
          meta: { previousAction: { type: module.REQUEST_MESSAGES, payload: { discussionId: 'a', request: { } } } },
        };
        expect(reducer(initialState, action)).toEqual({
          ...initialState,
          didDiscussionInvalidate: {},
          messagesById: {
            a1: message,
          },
          total: 1,
        });
      });
    });
  });
});
