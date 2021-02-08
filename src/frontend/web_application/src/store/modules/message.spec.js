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

    it('reduces REQUEST_MESSAGES', () => {
      const initialState = {
        ...reducer(undefined, { type: '@@INIT' }),
      };
      const action = module.requestMessages('timeline', '0');
      expect(reducer(initialState, action)).toEqual({
        ...initialState,
        messagesCollections: {
          timeline: {
            0: {
              isFetching: true,
              didInvalidate: false,
              messages: [],
              total: 0,
              request: {},
            },
          },
        },
      });
    });

    it('reduces INVALIDATE_MESSAGES', () => {
      const initialState = {
        ...reducer(undefined, { type: '@@INIT' }),
        messagesById: {
          a0: { body: 'already here', discussion_id: 'a', message_id: 'a0' },
        },
        messagesCollections: {
          timeline: {
            0: {
              isFetching: false,
              didInvalidate: false,
              messages: ['a0'],
              total: 1,
              request: {
                foo: 'bar',
              },
            },
          },
        },
      };
      const action = module.invalidate('timeline', '0');
      expect(reducer(initialState, action).messagesCollections).toEqual({
        ...initialState.messagesCollections,
        timeline: {
          0: {
            ...initialState.messagesCollections.timeline[0],
            didInvalidate: true,
          },
        },
      });
    });

    it('reduces INVALIDATE_ALL_MESSAGES', () => {
      const initialState = {
        ...reducer(undefined, { type: '@@INIT' }),
        messagesById: {
          a0: { body: 'already here', discussion_id: 'a001', message_id: 'a0' },
          a1: {
            body: 'already here 2',
            discussion_id: 'a002',
            message_id: 'a1',
          },
        },
        messagesCollections: {
          timeline: {
            0: {
              isFetching: false,
              didInvalidate: false,
              messages: ['a0', 'a1'],
              total: 2,
              request: {
                foo: 'bar',
              },
            },
          },
          discussion: {
            a001: {
              isFetching: false,
              didInvalidate: false,
              messages: ['a0'],
              total: 1,
              request: {
                foo: 'bar',
              },
            },
            a002: {
              isFetching: false,
              didInvalidate: false,
              messages: ['a1'],
              total: 1,
              request: {
                foo: 'bar',
              },
            },
          },
        },
      };
      const action = module.invalidateAll();
      expect(reducer(initialState, action).messagesCollections).toEqual({
        ...initialState.messagesCollections,
        timeline: {
          0: {
            ...initialState.messagesCollections.timeline[0],
            didInvalidate: true,
          },
        },
        discussion: {
          a001: {
            ...initialState.messagesCollections.discussion.a001,
            didInvalidate: true,
          },
          a002: {
            ...initialState.messagesCollections.discussion.a002,
            didInvalidate: true,
          },
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
          messagesCollections: {
            timeline: {
              0: {
                isFetching: false,
                didInvalidate: false,
                messages: ['a0'],
                total: 1,
                request: {
                  foo: 'bar',
                },
              },
            },
          },
        };
        const message = { body: 'foo', message_id: 'a1', discussion_id: 'a' };
        const action = {
          type: module.REQUEST_MESSAGES_SUCCESS,
          payload: {
            data: {
              total: 2,
              messages: [message],
            },
          },
          meta: {
            previousAction: {
              type: module.REQUEST_MESSAGES,
              payload: {
                type: 'timeline',
                key: '0',
                discussionId: 'a',
                request: { foo: 'bar' },
              },
            },
          },
        };
        expect(reducer(initialState, action)).toEqual({
          ...initialState,
          messagesById: {
            ...initialState.messagesById,
            a1: message,
          },
          messagesCollections: {
            timeline: {
              0: {
                isFetching: false,
                didInvalidate: false,
                messages: ['a0', 'a1'],
                total: 2,
                request: {
                  foo: 'bar',
                },
              },
            },
          },
        });
      });

      it('reduces with invalidateDiscussion', () => {
        const initialState = {
          ...reducer(undefined, { type: '@@INIT' }),
          messagesById: {
            a0: { body: 'I am invalid', discussion_id: 'a', message_id: 'a0' },
          },
          messagesCollections: {
            timeline: {
              0: {
                isFetching: false,
                didInvalidate: true,
                messages: ['a0'],
                total: 1,
                request: {
                  foo: 'bar',
                },
              },
            },
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
          meta: {
            previousAction: {
              type: module.REQUEST_MESSAGES,
              payload: {
                type: 'timeline',
                key: '0',
                discussionId: 'a',
                request: { foo: 'bar' },
              },
            },
          },
        };
        expect(reducer(initialState, action)).toEqual({
          ...initialState,
          messagesById: {
            ...initialState.messagesById,
            a1: message,
          },
          messagesCollections: {
            timeline: {
              0: {
                isFetching: false,
                didInvalidate: false,
                messages: ['a1'],
                total: 1,
                request: {
                  foo: 'bar',
                },
              },
            },
          },
        });
      });
    });

    describe('REQUEST_MESSAGE_SUCCESS', () => {
      it('reduces', () => {
        const initialState = {
          ...reducer(undefined, { type: '@@INIT' }),
          messagesById: {
            a0: { body: 'I am invalid', discussion_id: 'a', message_id: 'a0' },
          },
        };
        const message = { body: 'foo', message_id: 'a1', discussion_id: 'a' };
        const action = {
          type: module.REQUEST_MESSAGE_SUCCESS,
          payload: {
            data: message,
          },
        };
        expect(reducer(initialState, action)).toEqual({
          ...initialState,
          messagesById: {
            ...initialState.messagesById,
            a1: message,
          },
        });
      });
    });
  });

  describe('hasMore', () => {
    it('return true', () => {
      expect(module.hasMore({ messages: ['a1'], total: 2 })).toEqual(true);
    });
    it('return false', () => {
      expect(module.hasMore({ messages: ['a1'], total: 1 })).toEqual(false);
    });
  });

  describe('getNextOffset', () => {
    it('return 0', () => {
      expect(module.getNextOffset({ messages: [] })).toEqual(0);
    });
    it('return n', () => {
      expect(module.getNextOffset({ messages: ['a1', 'a3'] })).toEqual(2);
    });
  });
});
