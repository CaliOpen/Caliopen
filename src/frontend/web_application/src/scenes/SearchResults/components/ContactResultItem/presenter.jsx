import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Link from '../../../../components/Link';
import ContactAvatarLetter, { SIZE_SMALL } from '../../../../components/ContactAvatarLetter';
import TextBlock from '../../../../components/TextBlock';
import { formatName } from '../../../../services/contact';
import './style.scss';

class ContactResultItem extends PureComponent {
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
      <Link noDecoration className="m-contact-result-item" to={`/contacts/${contact.contact_id}`}>
        <div className="m-contact-result-item__contact-avatar">
          <ContactAvatarLetter isRound contact={contact} size={SIZE_SMALL} />
        </div>
        <TextBlock className="m-contact-result-item__contact-info">
          {contact.name_prefix && (<span className="m-contact-result-item__contact-prefix">{contact.name_prefix}</span>)}
          <span className="m-contact-result-item__contact-title">{this.renderTitle()}</span>
          {contact.name_suffix && (<span className="m-contact-result-item__contact-suffix">, {contact.name_suffix}</span>)}
        </TextBlock>
        {/*  TODO: add tags */}
      </Link>
    );
  }
}

export default ContactResultItem;
