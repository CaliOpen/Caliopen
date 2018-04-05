import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Title } from '../../../../components/';
import ContactItem from '../../components/ContactItem';
import { DEFAULT_SORT_DIR } from '../../presenter';
import { getFirstLetter, formatName } from '../../../../services/contact';

import './style.scss';

class ContactList extends PureComponent {
  static propTypes = {
    contacts: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    contactDisplayOrder: PropTypes.string.isRequired,
    contactDisplayFormat: PropTypes.string.isRequired,
    sortDir: PropTypes.string,
  };
  static defaultProps = {
    sortDir: DEFAULT_SORT_DIR,
  };

  render() {
    const {
      contacts, sortDir, contactDisplayOrder, contactDisplayFormat: format,
    } = this.props;
    const contactsGroupedByLetter = contacts
      .sort((a, b) =>
        (a[contactDisplayOrder] || a.title).localeCompare(b[contactDisplayOrder] || b.title))
      .reduce((acc, contact) => {
        const firstLetter =
          getFirstLetter(contact[contactDisplayOrder] || formatName({ contact, format }));

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
