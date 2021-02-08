import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Trans } from '@lingui/react';
import { AdvancedSelectFieldGroup, Icon } from '../../../../components';
import { Participant } from '../../../message';
import {
  IDENTITY_TYPE_TWITTER,
  IDENTITY_TYPE_MASTODON,
} from '../../../contact';

const PROTOCOL_EMAIL = 'email';
const PROTOCOL_TWITTER = 'twitter';
const PROTOCOL_MASTODON = 'mastodon';

class RecipientSelector extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    contact: PropTypes.shape({}),
    current: PropTypes.shape({}),
    availableProtocols: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

  static defaultProps = {
    className: undefined,
    current: undefined,
    contact: undefined,
  };

  renderRecipient = ({ recipient }) => {
    switch (recipient.protocol) {
      default:
      case PROTOCOL_EMAIL:
        return (
          <Fragment>
            <Icon type="email" /> {recipient.label} &lt;
            {recipient.address}&gt;
          </Fragment>
        );
      case PROTOCOL_TWITTER:
        return (
          <Fragment>
            <Icon type="twitter" /> {recipient.address}
          </Fragment>
        );
      case PROTOCOL_MASTODON:
        return (
          <Fragment>
            <Icon type="mastodon" /> {recipient.address}
          </Fragment>
        );
    }
  };

  render() {
    const {
      className,
      contact,
      onChange,
      current,
      availableProtocols,
    } = this.props;

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
            .filter((identity) =>
              [IDENTITY_TYPE_TWITTER].includes(identity.type)
            )
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
        label: recipient.label,
        advancedlabel: this.renderRecipient({ recipient }),
        value: recipient,
      }));

    if (options.length <= 1) {
      return null;
    }

    const selected = availableRecipients.find(
      (recipient) =>
        recipient.address === current.address &&
        recipient.protocol === current.protocol
    );

    return (
      <AdvancedSelectFieldGroup
        className={classnames(className)}
        label={
          <Trans id="draft-message.form.contact-recipient-selector">To:</Trans>
        }
        decorated={false}
        inline
        options={options}
        onChange={onChange}
        value={selected}
      />
    );
  }
}

export default RecipientSelector;
