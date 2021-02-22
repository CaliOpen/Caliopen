import { rest } from 'msw';

export const user = {
  user_id: 'u-john-01',
  name: 'Jaune',
  given_name: 'John Dœuf',
  contact_id: 'foobar112',
  contact: {
    addresses: [],
    privacy_features: {},
    phones: [],
    contact_id: 'c-john-01',
    date_insert: '2016-05-09T15:01:42.381000',
    identities: [],
    user_id: 'u-john-01',
    title: 'John',
    additional_name: '',
    date_update: null,
    organizations: [],
    ims: [],
    given_name: 'John Dœuf',
    name_prefix: null,
    deleted: 0,
    pi: { technic: 87, context: 45, comportment: 25 },
    tags: ['me'],
    infos: {
      birthday: '2016-05-09T15:01:42.11600',
    },
    emails: [
      {
        email_id: 'me-email',
        is_primary: 0,
        date_update: null,
        label: null,
        address: 'john@caliopen.local',
        date_insert: '2016-05-09T15:01:42.116000',
        type: 'home',
      },
    ],
    family_name: 'Dœuf',
    name_suffix: null,
    avatar: 'avatar.png',
    public_keys: [],
  },
  privacy_features: {
    password_strength: '2',
  },
};

export const userHandlers = [
  rest.get('/api/v1/me', (req, res, ctx) => {
    return res(ctx.json(user), ctx.status(200));
  }),
];
