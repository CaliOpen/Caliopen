import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Title } from '../../../../components/';
import ContactItem from '../../components/ContactItem';
import { DEFAULT_SORT_DIR } from '../../presenter';
import { getFirstLetter, formatName, getContactTitle } from '../../../../services/contact';

import './style.scss';

class ContactList extends PureComponent {
  static propTypes = {
    contacts: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    contact_display_order: PropTypes.string.isRequired,
    contact_display_format: PropTypes.string.isRequired,
    sortDir: PropTypes.string,
  };
  static defaultProps = {
    sortDir: DEFAULT_SORT_DIR,
  };

  render() {
    const { contacts, sortDir, contact_display_order, contact_display_format: format } = this.props;
    const contactsGroupedByLetter = contacts
      .sort((a, b) => (
        a[contact_display_order] || getContactTitle(a))
        .localeCompare(b[contact_display_order] || getContactTitle(b)
      ))
      .reduce((acc, contact) => {
        const firstLetter = getFirstLetter(
          contact[contact_display_order] || formatName({ contact, format })
        );

        return {
          ...acc,
          [firstLetter]: [
            ...(acc[firstLetter] || []),
            contact,
          ],
        };
      }, {});
    const firstLetters = Object.keys(contactsGroupedByLetter).sort((a, b) => {
      switch (sortDir) {
        default:
        case 'ASC':
          return (a || '').localeCompare(b);
        case 'DESC':
          return (b || '').localeCompare(a);
      }
    });

    return (
      <div className="m-contact-list">
        {firstLetters.map(letter => (
          <div key={letter} className="m-contact-list__group">
            <Title className="m-contact-list__alpha-title">{letter}</Title>
            {contactsGroupedByLetter[letter].map(contact => (
              <ContactItem contact={contact} key={contact.contact_id} />
            ))}
          </div>
        ))}
      </div>
    );
  }
}

export default ContactList;
