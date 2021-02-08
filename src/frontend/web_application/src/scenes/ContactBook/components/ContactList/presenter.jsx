import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import classnames from 'classnames';
import { Title, Link } from '../../../../components';
import { withTags } from '../../../../modules/tags';
import ContactItem from '../ContactItem';
import { DEFAULT_SORT_DIR } from '../../presenter';
import {
  getFirstLetter,
  formatName,
  getContactTitle,
} from '../../../../services/contact';

import './style.scss';

const ALPHA = '#abcdefghijklmnopqrstuvwxyz';
const MODE_ASSOCIATION = 'association';
const MODE_CONTACT_BOOK = 'contact-book';

@withTags()
class ContactList extends PureComponent {
  static propTypes = {
    contacts: PropTypes.arrayOf(PropTypes.shape({})),
    userContact: PropTypes.shape({}),
    selectedContactsIds: PropTypes.arrayOf(PropTypes.string),
    tags: PropTypes.arrayOf(PropTypes.shape({})),
    contactDisplayOrder: PropTypes.string.isRequired,
    contactDisplayFormat: PropTypes.string.isRequired,
    onSelectEntity: PropTypes.func,
    onClickContact: PropTypes.func,
    sortDir: PropTypes.string,
    mode: PropTypes.string,
  };

  static defaultProps = {
    contacts: [],
    userContact: undefined,
    tags: [],
    selectedContactsIds: [],
    sortDir: DEFAULT_SORT_DIR,
    mode: MODE_CONTACT_BOOK,
    onSelectEntity: () => {
      // noop
    },
    onClickContact: undefined,
  };

  getNavLetter = () => {
    const { sortDir } = this.props;

    return ALPHA.split('').sort((a, b) => {
      switch (sortDir) {
        default:
        case 'ASC':
          return (a || '').localeCompare(b);
        case 'DESC':
          return (b || '').localeCompare(a);
      }
    });
  };

  renderNav(firstLettersWithContacts = []) {
    const firstLetters = this.getNavLetter();

    return (
      <div className="m-contact-list__nav">
        {firstLetters.map((letter) => {
          const isActive = firstLettersWithContacts.includes(letter);

          return (
            <Link
              key={letter}
              href={`#letter-${letter}`}
              className={classnames('m-contact-list__alpha-letter', {
                'm-contact-list__alpha-letter--active': isActive,
              })}
              disabled={!isActive}
            >
              {letter}
            </Link>
          );
        })}
      </div>
    );
  }

  renderPlaceholder() {
    const noop = () => {
      // noop
    };

    return (
      <div className="m-contact-list">
        {this.renderNav()}
        <div className="m-contact-list__list">
          <div className="m-contact-list__group">
            {[1, 2, 3, 4, 5].map((key) => (
              <ContactItem
                key={key}
                className="m-contact-list__contact"
                onSelectEntity={noop}
                isContactSelected={false}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {
      contacts,
      userContact,
      contactDisplayOrder,
      contactDisplayFormat: format,
      onSelectEntity,
      selectedContactsIds,
      tags,
      mode,
      onClickContact,
    } = this.props;

    if (!contacts.length && !userContact) {
      return this.renderPlaceholder();
    }

    const contactsGroupedByLetter = contacts
      .sort((a, b) =>
        (a[contactDisplayOrder] || getContactTitle(a)).localeCompare(
          b[contactDisplayOrder] || getContactTitle(b)
        )
      )
      .reduce((acc, contact) => {
        const firstLetter = getFirstLetter(
          contact[contactDisplayOrder] || formatName({ contact, format }),
          '#'
        );

        return {
          ...acc,
          [firstLetter]: [...(acc[firstLetter] || []), contact],
        };
      }, {});

    const firstLettersWithContacts = Object.keys(contactsGroupedByLetter);
    const firstLetters = this.getNavLetter();

    return (
      <div className="m-contact-list">
        {this.renderNav(firstLettersWithContacts)}
        <div className="m-contact-list__list">
          {userContact && (
            <div className="m-contact-list__group">
              <Title
                caps
                hr
                size="large"
                className="m-contact-list__alpha-title"
              >
                <Trans id="contact-book.my-contact-details">
                  Mes coordonées
                </Trans>
              </Title>
              <ContactItem
                className="m-contact-list__contact"
                contact={userContact}
                tags={tags}
                selectDisabled
                onClickContact={onClickContact}
                mode={mode}
              />
            </div>
          )}
          {firstLetters.map(
            (letter) =>
              contactsGroupedByLetter[letter] && (
                <div key={letter} className="m-contact-list__group">
                  <Title
                    caps
                    hr
                    size="large"
                    className="m-contact-list__alpha-title"
                    id={`letter-${letter}`}
                  >
                    {letter}
                  </Title>
                  {contactsGroupedByLetter[letter].map((contact) => (
                    <ContactItem
                      key={contact.contact_id}
                      className="m-contact-list__contact"
                      contact={contact}
                      onSelectEntity={onSelectEntity}
                      onClickContact={onClickContact}
                      isContactSelected={selectedContactsIds.includes(
                        contact.contact_id
                      )}
                      tags={tags}
                      selectDisabled={mode === MODE_ASSOCIATION}
                      mode={mode}
                    />
                  ))}
                </div>
              )
          )}
        </div>
      </div>
    );
  }
}

export default ContactList;
