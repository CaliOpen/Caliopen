import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ContactAvatarLetter, SIZE_SMALL } from '../../../../modules/avatar';
import { Link, TextBlock } from '../../../../components/';
import { formatName } from '../../../../services/contact';

class ContactItem extends PureComponent {
  static propTypes = {
    contact: PropTypes.shape({}).isRequired,
    contactDisplayFormat: PropTypes.string.isRequired,
  };
  static defaultProps = {
  };

  render() {
    const { contact, contactDisplayFormat: format } = this.props;
    const contactTitle = formatName({ contact, format });

    return (
      <Link noDecoration className="m-contact-list__contact" to={`/contacts/${contact.contact_id}`}>
        <div className="m-contact-list__contact-avatar">
          <ContactAvatarLetter
            isRound
            contact={contact}
            size={SIZE_SMALL}
            contactDisplayFormat={format}
          />
        </div>
        <TextBlock className="m-contact-list__contact-info">
          {contact.name_prefix && (<span className="m-contact-list__contact-prefix">{contact.name_prefix}</span>)}
          <span className="m-contact-list__contact-title">{contactTitle}</span>
          {contact.name_suffix && (<span className="m-contact-list__contact-suffix">, {contact.name_suffix}</span>)}
        </TextBlock>
        {/*  TODO: add tags */}
      </Link>
    );
  }
}

export default ContactItem;
