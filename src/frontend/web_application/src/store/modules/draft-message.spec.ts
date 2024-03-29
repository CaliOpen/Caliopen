import { IDraftMessageFormData } from 'src/modules/draftMessage/types';
import reducer, * as drafMessageModule from './draft-message';

describe('ducks module draft-message', () => {
  describe('reducer', () => {
    it('reduces EDIT_DRAFT', () => {
      const draft: IDraftMessageFormData = {
        message_id: '111',
        recipients: [],
        participants: [],
        body: 'bar',
        identity_id: 'aaa',
      };
      const initialState = {
        ...reducer(undefined, { type: '@@INIT' }),
        draftsByMessageId: {
          111: draft,
        },
      };
      const body = 'foo';
      expect(
        reducer(undefined, drafMessageModule.editDraft({ ...draft, body }))
      ).toEqual({
        ...initialState,
        draftsByMessageId: {
          111: {
            ...draft,
            body,
          },
        },
      });
    });
  });
});
