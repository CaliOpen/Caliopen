import { filterIdentities } from './filterIdentities';

describe('modules identity - service - filterIdentities', () => {
  const identities = [
    { identity_id: 'foo', type: 'local', protocol: 'email' },
    { identity_id: 'bar', type: 'remote', protocol: 'twitter' },
    { identity_id: 'baz', type: 'remote', protocol: 'email' },
  ];

  const contacts = [
    {
      contact_id: 'contact-user',
      emails: [{ address: 'me@caliopen.local' }],
      identities: [{ name: 'me', type: 'twitter' }],
    },
    {
      contact_id: 'contact-with-all-protocols',
      emails: [{ address: 'foo@bar.tld' }],
      identities: [{ name: 'foo', type: 'twitter' }],
    },
    {
      contact_id: 'contact-with-email-protocol',
      emails: [{ address: 'foo2@bar2.tld' }],
    },
    {
      contact_id: 'contact-with-same-email-user',
      emails: [{ address: 'me@caliopen.local' }],
    },
  ];

  const user = {
    contact: {
      contact_id: 'contact-user',
    },
  };

  it('list all when no parent', () => {
    expect(filterIdentities({ identities, contacts, user })).toEqual(
      identities
    );
  });

  it('filter parent message protocol (email) (1-to-n no contacts)', () => {
    const parentMessage = {
      protocol: 'email',
      participants: [
        { address: 'foo@contact.tld', protocol: 'email' },
        { address: 'foo2@contact.tld', protocol: 'email' },
        {
          address: 'me@caliopen.local',
          protocol: 'email',
          contact_ids: ['contact-user'],
        },
      ],
    };

    expect(
      filterIdentities({
        identities,
        parentMessage,
        contacts,
        user,
      })
    ).toEqual([identities[0], identities[2]]);
  });

  it('filter parent message protocol (twitter) (1-to-n)', () => {
    const parentMessage = {
      protocol: 'twitter',
      participants: [
        { address: '@contact', protocol: 'twitter' },
        { address: '@contact2', protocol: 'twitter' },
        { address: '@me', protocol: 'twitter', contact_ids: ['contact-user'] },
      ],
    };

    expect(
      filterIdentities({
        identities,
        parentMessage,
        contacts,
        user,
      })
    ).toEqual([identities[1]]);
  });

  it('filter discussion 1-to-1 available contact address', () => {
    const parentMessage = {
      protocol: 'twitter',
      participants: [
        {
          address: '@contact',
          protocol: 'twitter',
          contact_ids: ['contact-with-all-protocols'],
        },
        { address: '@me', protocol: 'twitter', contact_ids: ['contact-user'] },
      ],
    };

    expect(
      filterIdentities({
        identities,
        parentMessage,
        contacts,
        user,
      })
    ).toEqual(identities);
  });

  it('filter discussion 1-to-1 without contact', () => {
    const parentMessage = {
      protocol: 'twitter',
      participants: [
        { address: '@contact', protocol: 'twitter' },
        { address: '@me', protocol: 'twitter', contact_ids: ['contact-user'] },
      ],
    };

    expect(
      filterIdentities({
        identities,
        parentMessage,
        contacts,
        user,
      })
    ).toEqual([identities[1]]);
  });

  it('filter discussion 1-to-n with contacts', () => {
    const parentMessage = {
      protocol: 'email',
      participants: [
        {
          address: 'foo@bar.tld',
          protocol: 'email',
          contacts_ids: ['contact-with-all-protocols'],
        },
        {
          address: 'foo2@bar2.tld',
          protocol: 'email',
          contacts_ids: ['contact-with-email-protocol'],
        },
        {
          address: 'me@caliopen.local',
          protocol: 'email',
          contact_ids: ['contact-user'],
        },
      ],
    };

    expect(
      filterIdentities({
        identities,
        parentMessage,
        contacts,
        user,
      })
    ).toEqual([identities[0], identities[2]]);
  });

  // TODO: temporary fix for https://github.com/CaliOpen/Caliopen/issues/1131
  it('mail identities can be several protocols', () => {
    const multiMailIdentitities = [
      { identity_id: 'foo', type: 'local', protocol: 'smtp' },
      { identity_id: 'bar', type: 'remote', protocol: 'imap' },
      { identity_id: 'baz', type: 'remote', protocol: 'email' },
      { identity_id: 'bad', type: 'remote', protocol: 'twitter' },
    ];
    const parentMessage = {
      protocol: 'email',
      participants: [
        {
          address: 'foo@bar.tld',
          protocol: 'email',
          contacts_ids: ['contact-with-all-protocols'],
        },
        {
          address: 'foo2@bar2.tld',
          protocol: 'email',
          contacts_ids: ['contact-with-email-protocol'],
        },
        {
          address: 'me@caliopen.local',
          protocol: 'email',
          contact_ids: ['contact-user'],
        },
      ],
    };

    expect(
      filterIdentities({
        identities: multiMailIdentitities,
        parentMessage,
        contacts,
        user,
      })
    ).toEqual([
      multiMailIdentitities[0],
      multiMailIdentitities[1],
      multiMailIdentitities[2],
    ]);
  });

  // TODO: temporary fix for https://github.com/CaliOpen/Caliopen/issues/1130
  it('parent message might not has protocol', () => {
    const parentMessage = {
      participants: [
        {
          address: 'foo@bar.tld',
          protocol: 'email',
          contacts_ids: ['contact-with-all-protocols'],
        },
        {
          address: 'foo2@bar2.tld',
          protocol: 'email',
          contacts_ids: ['contact-with-email-protocol'],
        },
        {
          address: 'me@caliopen.local',
          protocol: 'email',
          contact_ids: ['contact-user'],
        },
      ],
    };

    expect(
      filterIdentities({
        identities,
        parentMessage,
        contacts,
        user,
      })
    ).toEqual([identities[0], identities[2]]);
  });

  it('only the message protocol when an unknown participant and one contact', () => {
    const parentMessage = {
      participants: [
        {
          address: 'simple@participant.tld',
          protocol: 'email',
          type: 'To',
        },
        {
          address: 'foo@bar.tld',
          contact_ids: ['contact-with-all-protocols'],
          protocol: 'email',
          type: 'To',
        },
        {
          address: 'me@caliopen.local',
          contact_ids: ['contact-user'],
          protocol: 'smtp',
          type: 'From',
        },
      ],
    };

    expect(
      filterIdentities({
        identities,
        parentMessage,
        contacts,
        user,
      })
    ).toEqual([identities[0], identities[2]]);
  });

  it('contacts not loaded', () => {
    const parentMessage = {
      participants: [
        {
          address: 'simple@participant.tld',
          protocol: 'email',
          type: 'To',
        },
        {
          address: 'me@caliopen.local',
          contact_ids: ['contact-with-same-email-user'],
          label: 'chamal@alpha.caliopen.org',
          protocol: 'email',
          type: 'To',
        },
        {
          address: 'me@caliopen.local',
          contact_ids: ['contact-user'],
          label: 'chamal None',
          protocol: 'smtp',
          type: 'From',
        },
      ],
    };

    expect(
      filterIdentities({
        identities,
        parentMessage,
        contacts: [],
        user,
      })
    ).toEqual([identities[0], identities[2]]);
  });
});
