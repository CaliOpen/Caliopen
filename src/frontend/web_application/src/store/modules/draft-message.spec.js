import reducer, * as module from './draft-message';

describe('ducks module draft-message', () => {
  describe('reducer', () => {
    it('reduces EDIT_DRAFT', () => {
      const draft = { message_id: '111', participants: [], body: 'bar' };
      const initialState = {
        ...reducer(undefined, { type: '@@INIT' }),
        draftsByInternalId: {
          a111: draft,
        },
      };
      const body = 'foo';
      expect(reducer(undefined, module.editDraft({ internalId: 'a111', draft: { ...draft, body } }))).toEqual({
        ...initialState,
        draftsByInternalId: {
          a111: {
            ...draft,
            body,
          },
        },
      });
    });

    it('reduces SYNC_DRAFT', () => {
      const draft = { participants: [], body: 'new body' };
      const initialState = {
        ...reducer(undefined, { type: '@@INIT' }),
        draftsByInternalId: {
          a111: draft,
        },
      };
      const message = {
        body: 'old body',
        message_id: '111',
        discussion_id: '112',
      };
      expect(reducer(initialState, module.syncDraft({ internalId: 'a111', draft: message }))).toEqual({
        ...initialState,
        draftsByInternalId: {
          a111: {
            participants: [],
            body: 'new body',
            message_id: '111',
            discussion_id: '112',
          },
        },
      });
    });
  });
});
