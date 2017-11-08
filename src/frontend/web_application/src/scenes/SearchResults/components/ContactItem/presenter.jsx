import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Link from '../../../../components/Link';
import ContactAvatarLetter, { SIZE_SMALL } from '../../../../components/ContactAvatarLetter';
import TextBlock from '../../../../components/TextBlock';
import { formatName } from '../../../../services/contact';
import './style.scss';

class ContactItem extends PureComponent {
  static propTypes = {
    contact: PropTypes.shape({}).isRequired,
    contact_display_format: PropTypes.string.isRequired,
  };
  static defaultProps = {
  };

  renderTitle() {
    const { contact, contact_display_format: format } = this.props;

    return formatName({ contact, format });
  }

  render() {
    const { contact } = this.props;

    return (
      <Link noDecoration className="m-contact-item" to={`/contacts/${contact.contact_id}`}>
        <div className="m-contact-item__contact-avatar">
          <ContactAvatarLetter isRound contact={contact} size={SIZE_SMALL} />
        </div>
        <TextBlock className="m-contact-item__contact-info">
          {contact.name_prefix && (<span className="m-contact-item__contact-prefix">{contact.name_prefix}</span>)}
          <span className="m-contact-item__contact-title">{this.renderTitle()}</span>
          {contact.name_suffix && (<span className="m-contact-item__contact-suffix">, {contact.name_suffix}</span>)}
        </TextBlock>
        {/*  TODO: add tags */}
      </Link>
    );
  }
}

export default ContactItem;
