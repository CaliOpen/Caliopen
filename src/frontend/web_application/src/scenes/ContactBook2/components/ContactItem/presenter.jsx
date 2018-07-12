import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { ContactAvatarLetter, SIZE_MEDIUM } from '../../../../modules/avatar';
import { Link, TextBlock, Icon, Checkbox } from '../../../../components/';
import { formatName } from '../../../../services/contact';
import './style.scss';

class ContactItem extends PureComponent {
  static propTypes = {
    contact: PropTypes.shape({}).isRequired,
    contactDisplayFormat: PropTypes.string.isRequired,
    className: PropTypes.string,
  };
  static defaultProps = {
    className: undefined,
  };

  render() {
    const { contact, contactDisplayFormat: format, className } = this.props;
    const contactTitle = formatName({ contact, format });

    return (
      <div className={classnames('contact-item', className)}>
        <Link noDecoration to={`/contacts/${contact.contact_id}`} className="contact-item__title">
          <div className="contact-item__avatar">
            <ContactAvatarLetter
              isRound
              contact={contact}
              size={SIZE_MEDIUM}
              contactDisplayFormat={format}
            />
          </div>
          <TextBlock className="contact-item__name">
            {contact.name_prefix && (<span className="contact-item__contact-prefix">{contact.name_prefix}</span>)}
            <span className="contact-item__contact-title">{contactTitle}</span>
            {contact.name_suffix && (<span className="contact-item__contact-suffix">, {contact.name_suffix}</span>)}
          </TextBlock>
        </Link>
        {/*  TODO: add tags */}
        <TextBlock className="contact-item__info">
          <div className="contact-item__interactions">
            <span className="contact-item__interactions-icon"><Icon type="exchange" spaced /></span>
            <span className="contact-item__interactions-nb">123 messages échangés</span>
          </div>
          <div className="contact-item__interactions-info">
            dernier il y a 1h | <Link to="/compose"><Icon type="pencil" /> écrire</Link>
          </div>
        </TextBlock>
        <TextBlock className="contact-item__select">
          <Checkbox />
        </TextBlock>
      </div>
    );
  }
}

export default ContactItem;
