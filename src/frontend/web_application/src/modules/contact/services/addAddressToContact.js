import {
  PROTOCOL_EMAIL,
  PROTOCOL_TWITTER,
  PROTOCOL_MASTODON,
} from '../../remoteIdentity';

export const addAddressToContact = (contact, { address, protocol }) => {
  switch (protocol) {
    case PROTOCOL_EMAIL:
      return {
        ...contact,
        emails: [...(contact.emails ? contact.emails : []), { address }],
      };
    case PROTOCOL_TWITTER:
    case PROTOCOL_MASTODON:
      return {
        ...contact,
        identities: [
          ...(contact.identities ? contact.identities : []),
          { type: protocol, name: address },
        ],
      };
    default:
      throw new Error(`unknown protocol "${protocol}"`);
  }
};

export const addAddressesToContact = (contact, addresses) => {
  const emails = [
    ...(contact.emails ? contact.emails : []),
    ...addresses
      .filter((address) => address.protocol === PROTOCOL_EMAIL)
      .map((address) => ({ address: address.email })),
  ];

  const identities = [
    ...(contact.identities ? contact.identities : []),
    ...addresses
      .filter((address) =>
        [PROTOCOL_TWITTER, PROTOCOL_MASTODON].includes(address.protocol)
      )
      .map((address) => ({
        address: address.identifier,
        type: address.protocol,
      })),
  ];

  return {
    ...contact,
    emails,
    identities,
  };
};
