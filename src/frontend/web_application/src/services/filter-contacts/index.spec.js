import contactFilter from './index';

describe('Service contactFilter', () => {
  it('finds a contact using a part of a simple property like title', () => {
    const contacts = [
      {
        addresses: [],
        privacy_features: {},
        phones: [],
        contact_id: '92d3727a-eefc-4537-b879-85f1c9d197bb',
        date_insert: '2016-05-09T15:01:42.381000',
        identities: [],
        user_id: '124489c3-fc63-4e41-b490-5f4dd317aa50',
        title: 'Bender',
        additional_name: '',
        date_update: null,
        organizations: [],
        ims: [],
        given_name: 'Bender Bending',
        name_prefix: null,
        deleted: 0,
        privacy_index: 0,
        infos: {},
        emails: [
          {
            email_id: '93f03145-4398-4bd4-9bd5-00000001',
            is_primary: 0,
            date_update: null,
            label: null,
            address: 'bender@caliopen.local',
            date_insert: '2016-05-09T15:01:42.116000',
            type: 'other',
          },
        ],
        family_name: 'Rodriguez',
        name_suffix: null,
        avatar: 'avatar.png',
        public_keys: [],
      },
      {
        addresses: [],
        privacy_features: {},
        phones: [],
        contact_id: '0ba2e346-e4f8-4c45-9adc-eeb1d42fuie0',
        date_insert: '2016-05-09T15:01:43.381000',
        identities: [],
        user_id: '344489c3-fc63-4e41-b490-5f4dd317aa51',
        title: 'Zoidberg',
        additional_name: null,
        date_update: null,
        organizations: [],
        ims: [],
        given_name: 'John',
        name_prefix: 'Dr',
        deleted: 0,
        privacy_index: 0,
        infos: {},
        emails: [
          {
            email_id: '93f03145-4398-4bd4-9bd5-00000002',
            is_primary: 0,
            date_update: null,
            label: null,
            address: 'zoidberg@caliopen.local',
            date_insert: '2016-05-09T15:01:43.116000',
            type: 'other',
          },
        ],
        family_name: 'Zoidberg',
        name_suffix: null,
        avatar: 'avatar.png',
        public_keys: [],
      },
    ];
    expect(
      contactFilter({
        contacts,
        searchTerms: 'end',
      })
    ).toEqual([contacts[0]]);
  });

  it('finds a contact by a sub property like identities', () => {
    const contacts = [
      { identities: [{ name: 'foobar' }] },
      { identities: [{ identity_id: 'foobar' }] },
      { identities: [{ identity_id: 'bar' }] },
    ];
    expect(
      contactFilter({
        contacts,
        searchTerms: 'oba',
      })
    ).toEqual([contacts[0], contacts[1]]);
  });

  it('finds a contact which contains special chars', () => {
    const contacts = [{ given_name: "J'own d'œuf" }, { given_name: 'jérém' }];

    expect(
      contactFilter({
        contacts,
        searchTerms: 'œuf',
      })
    ).toEqual([contacts[0]]);

    expect(
      contactFilter({
        contacts,
        searchTerms: 'jérém',
      })
    ).toEqual([contacts[1]]);
  });

  it('finds a contact which contains uppercases', () => {
    const contacts = [{ given_name: 'jOhny' }];

    expect(
      contactFilter({
        contacts,
        searchTerms: 'john',
      })
    ).toEqual([contacts[0]]);
  });
});
