import configureMockStore from 'redux-mock-store';
import promiseMiddleware from '../../../store/middlewares/promise-middleware';
import thunkMiddleware from '../../../store/middlewares/thunk-middleware';
import { requestParticipantSuggestions } from './requestParticipantSuggestions';

jest.mock('../../../store/modules/participant-suggestions', () => ({
  suggest: (term, context) => ({
    type: 'axiosReqMocked',
    payload: {
      data: [],
    },
  }),
  searchSuccess: () => ({
    type: 'searchSuccess',
    payload: {},
  }),
}));

const mockStore = configureMockStore([promiseMiddleware, thunkMiddleware]);

describe('modules draftMessage - actions - requestParticipantSuggestions', () => {
  it('suggests', async () => {
    const store = mockStore({
      settings: { settings: { contact_display_format: 'given_name' } },
    });
    const expectedActions = [
      {
        type: 'axiosReqMocked',
        payload: {
          data: [],
        },
      },
      {
        type: 'searchSuccess',
        payload: {},
      },
    ];
    const action = requestParticipantSuggestions({ terms: 'foo', context: 'msg_compose' });

    const result = await store.dispatch(action);
    expect(result).toEqual({
      type: 'searchSuccess',
      payload: {},
    });
    expect(store.getActions()).toEqual(expectedActions);
  });
});
