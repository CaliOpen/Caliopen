import configureMockStore from 'redux-mock-store';
import promiseMiddleware from '../../../store/middlewares/promise-middleware';
import thunkMiddleware from '../../../store/middlewares/thunk-middleware';
import { getDefaultIdentity } from './getDefaultIdentity';

const mockStore = configureMockStore([promiseMiddleware, thunkMiddleware]);

describe('modules identity - actions - getDefaultIdentity', () => {
  const localIdentity = {
    identity_id: 'local-identity',
    identifier: 'foo@caliopen.local',
    protocol: 'email',
    type: 'local',
  };
  const remoteEmailIdentity = {
    identity_id: 'remote-email-identity',
    identifier: 'foo@remote.tld',
    protocol: 'email',
    type: 'remote',
  };
  const remoteEmailIdentity2 = {
    identity_id: 'remote-email-identity2',
    identifier: 'foo2@remote.tld',
    protocol: 'email',
    type: 'remote',
  };
  const remoteTwitterIdentity = {
    identity_id: 'remote-twitter-identity',
    identifier: '@foo',
    protocol: 'twitter',
    type: 'remote',
  };
  const store = mockStore({
    localIdentity: {
      isFetching: false,
      didInvalidate: false,
      localIdentities: [localIdentity],
      total: 1,
    },
    remoteIdentity: {
      isFetching: false,
      didInvalidate: false,
      remoteIdentitiesById: {
        [remoteEmailIdentity.identity_id]: remoteEmailIdentity,
        [remoteEmailIdentity2.identity_id]: remoteEmailIdentity2,
        [remoteTwitterIdentity.identity_id]: remoteTwitterIdentity,
      },
      remoteIdentities: [
        remoteEmailIdentity.identity_id,
        remoteEmailIdentity2.identity_id,
        remoteTwitterIdentity.identity_id,
      ],
      total: 2,
    },
  });

  it('returns default local identity', async () => {
    const expectedActions = [];
    const action = getDefaultIdentity();

    const result = await store.dispatch(action);
    expect(result).toEqual(localIdentity);
    expect(store.getActions()).toEqual(expectedActions);
  });

  describe('with parentMessage', () => {
    it('uses local identity', async () => {
      const protocol = 'email';
      const participants = [
        { address: localIdentity.identifier, type: 'To', protocol: 'email' },
        {
          address: remoteEmailIdentity.identifier,
          type: 'From',
          protocol: 'email',
        },
      ];
      const action = getDefaultIdentity({ participants, protocol });
      const expectedActions = [];

      const result = await store.dispatch(action);
      expect(result).toEqual(localIdentity);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('uses email remote identity', async () => {
      const protocol = 'email';
      const participants = [
        { address: 'bar@contact.tld', type: 'To', protocol: 'email' },
        {
          address: remoteEmailIdentity.identifier,
          type: 'From',
          protocol: 'email',
        },
      ];
      const action = getDefaultIdentity({ participants, protocol });
      const expectedActions = [];

      const result = await store.dispatch(action);
      expect(result).toEqual(remoteEmailIdentity);
      expect(store.getActions()).toEqual(expectedActions);
    });

    // XXX: this test does not more than previous one
    xit('uses email remote identity according to recipients', async () => {
      const protocol = 'email';
      const participants = [
        { address: 'bar@contact.tld', type: 'To', protocol: 'email' },
        {
          address: remoteEmailIdentity.identifier,
          type: 'From',
          protocol: 'email',
        },
        {
          address: remoteEmailIdentity2.identifier,
          type: 'To',
          protocol: 'email',
        },
      ];
      const action = getDefaultIdentity({ participants, protocol });
      const expectedActions = [];

      const result = await store.dispatch(action);
      expect(result).toEqual(remoteEmailIdentity);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('uses twitter identity', async () => {
      const protocol = 'twitter';
      const participants = [
        { address: '@whatever', type: 'To', protocol: 'twitter' },
        { address: '@whateverToo', type: 'From', protocol: 'twitter' },
      ];
      const action = getDefaultIdentity({ participants, protocol });
      const expectedActions = [];

      const result = await store.dispatch(action);
      expect(result).toEqual(remoteTwitterIdentity);
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
