import * as React from 'react';
import classnames from 'classnames';
import { Trans } from '@lingui/react';
import { createSelector } from 'reselect';
import { useSelector } from 'react-redux';
import { identitiesSelector } from 'src/modules/identity';
import { AdvancedSelectFieldGroup, Icon } from 'src/components';
import { Participant } from 'src/modules/message';
import {
  IDENTITY_TYPE_TWITTER,
  IDENTITY_TYPE_MASTODON,
  contactSelector,
} from 'src/modules/contact';
import { RootState } from 'src/store/reducer';
import { Contact } from 'src/modules/contact/types';
import { ProviderIcon } from 'src/modules/remoteIdentity';
import { getIdentityProtocol } from '../services/getIdentityProtocol';
import { Recipient } from '../types';

const PROTOCOL_EMAIL = 'email';
const PROTOCOL_TWITTER = 'twitter';
const PROTOCOL_MASTODON = 'mastodon';

const availableProtocolsSelector = createSelector(
  [identitiesSelector],
  (identities) => identities.map((identity) => getIdentityProtocol(identity))
);

const computeValue = (recipient: Recipient) =>
  `${recipient.address}_${recipient.protocol}`;

interface Props {
  contactId: string;
  className?: string;
  onChange: (recipient: undefined | Recipient) => void;
  current?: Recipient;
}

function RecipientSelector({ contactId, className, current, onChange }: Props) {
  const contact = useSelector<RootState, void | Contact>((state) =>
    contactSelector(state, contactId)
  );
  const availableProtocols = useSelector(availableProtocolsSelector);

  const renderAdvancedLabel = (recipient: Recipient) => {
    switch (recipient.protocol) {
      default:
      case PROTOCOL_EMAIL:
        return (
          <>
            <Icon type="email" /> {recipient.label} &lt;
            {recipient.address}&gt;
          </>
        );
      case PROTOCOL_TWITTER:
        return (
          <>
            <ProviderIcon size="normal" providerName="twitter" /> @
            {recipient.address}
          </>
        );
      case PROTOCOL_MASTODON:
        return (
          <>
            <ProviderIcon size="normal" providerName="mastodon" />{' '}
            {recipient.address}
          </>
        );
    }
  };
  const renderLabel = (recipient: Recipient) => {
    switch (recipient.protocol) {
      default:
      case PROTOCOL_EMAIL:
        return `${recipient.label} &lt;${recipient.address}&gt;`;
      case PROTOCOL_TWITTER:
        return `@${recipient.address} (${recipient.protocol})`;
      case PROTOCOL_MASTODON:
        return `${recipient.address} (${recipient.protocol})`;
    }
  };

  // the contact associated to the participant might be deleted
  if (!contact) {
    return null;
  }

  const availableRecipients = [
    ...(contact.emails
      ? contact.emails.map(
          (email) =>
            new Participant({
              address: email.address,
              label: contact.given_name || email.address,
              contact_ids: [contact.contact_id],
              protocol: PROTOCOL_EMAIL,
            })
        )
      : []),
    ...(contact.identities
      ? contact.identities
          .filter((identity) => [IDENTITY_TYPE_TWITTER].includes(identity.type))
          .map(
            (identity) =>
              new Participant({
                address: identity.name,
                label: identity.name,
                contact_ids: [contact.contact_id],
                protocol: PROTOCOL_TWITTER,
              })
          )
      : []),
    ...(contact.identities
      ? contact.identities
          .filter((identity) =>
            [IDENTITY_TYPE_MASTODON].includes(identity.type)
          )
          .map(
            (identity) =>
              new Participant({
                address: identity.name,
                label: identity.name,
                contact_ids: [contact.contact_id],
                protocol: PROTOCOL_MASTODON,
              })
          )
      : []),
  ];

  const options = availableRecipients
    .filter((recipient) => availableProtocols.includes(recipient.protocol))
    .map((recipient) => ({
      label: renderLabel(recipient),
      advancedlabel: renderAdvancedLabel(recipient),
      value: computeValue(recipient),
    }));

  if (options.length <= 1) {
    return null;
  }

  const value = current ? computeValue(current) : undefined;

  const handleChange = (nextValue) => {
    const selected = availableRecipients.find(
      (recipient) => computeValue(recipient) === nextValue
    );
    onChange(selected);
  };

  return (
    <AdvancedSelectFieldGroup
      selectId="recipient-select"
      dropdownId="recipient-dropdown-select"
      className={classnames(className)}
      label={
        <Trans
          id="draft-message.form.contact-recipient-selector"
          message="To:"
        />
      }
      inline
      options={options}
      onChange={handleChange}
      value={value}
    />
  );
}

export default RecipientSelector;
