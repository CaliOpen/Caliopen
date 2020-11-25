import { IDraftMessageFormData } from 'src/modules/draftMessage/types';
import reducer, * as module from './draft-message';

describe('ducks module draft-message', () => {
  describe('reducer', () => {
    it('reduces EDIT_DRAFT', () => {
      const draft: IDraftMessageFormData = {
        message_id: '111',
        recipients: [],
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
      expect(reducer(undefined, module.editDraft({ ...draft, body }))).toEqual({
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
