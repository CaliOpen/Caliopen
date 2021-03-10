import * as React from 'react';
import { Trans, withI18n, withI18nProps } from '@lingui/react';
import classnames from 'classnames';
import { RootState } from 'src/store/reducer';
import { Title, Link, PlaceholderList } from 'src/components';
import { useSettings } from 'src/modules/settings';
import { useUser, store as userStore } from 'src/modules/user';
import {
  getFirstLetter,
  formatName,
  getContactTitle,
} from 'src/services/contact';
import { useContacts } from '../../hooks/useContacts';
import { DEFAULT_SORT_DIR } from '../../consts';
import { ContactPayload, TSortDir } from '../../types';

import ContactItem from './components/ContactItem';
import { stateSelector as contactStateSelector } from '../../store';

import './style.scss';
import { useSelector } from 'react-redux';
import { contactSelector } from '../../selectors/contactSelector';
import ContactItemPlaceholder from './components/ContactItemPlaceholder';

const ALPHA = '#abcdefghijklmnopqrstuvwxyz';
const MODE_ASSOCIATION = 'association';
const MODE_CONTACT_BOOK = 'contact-book';

type TMode = typeof MODE_ASSOCIATION | typeof MODE_CONTACT_BOOK;

const getNavLetter = (sortDir: TSortDir) => {
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

interface NavProps {
  sortDir: TSortDir;
  firstLettersWithContacts?: string[];
}
function Nav({ sortDir, firstLettersWithContacts = [] }: NavProps) {
  const firstLetters = getNavLetter(sortDir);

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

interface Props extends withI18nProps {
  selectedContactsIds?: string[]; // mode contact_book
  onSelectEntity?: () => void; // mode contact_book
  onClickContact?: (contact: ContactPayload) => void; // mode association
  sortDir?: TSortDir;
  mode: TMode;
}
function ContactList({
  i18n,
  onClickContact,
  onSelectEntity,
  mode,
  sortDir = DEFAULT_SORT_DIR,
  selectedContactsIds,
}: Props) {
  const { contact_display_order, contact_display_format } = useSettings();
  const { user, initialized: userInitialized, status: userStatus } = useUser();
  const {
    contacts,
    initialized: contactsInitialized,
    status: contactsStatus,
  } = useContacts();

  const initialized = userInitialized && contactsInitialized;
  const userContact = useSelector<RootState, void | ContactPayload>(
    (state) => user && contactSelector(state, user?.contact.contact_id)
  );

  if (!initialized) {
    return (
      <div className="m-contact-list">
        <Nav sortDir={sortDir} />
        <div className="m-contact-list__list">
          <div className="m-contact-list__group">
            <PlaceholderList
              renderItem={() => (
                <ContactItemPlaceholder className="m-contact-list__contact" />
              )}
              title={i18n._('contact-asociation.loading', undefined, {
                defaults: 'Contact list is loading.',
              })}
            />
          </div>
        </div>
      </div>
    );
  }

  const contactsGroupedByLetter = contacts
    .sort((a, b) =>
      (a[contact_display_order] || getContactTitle(a)).localeCompare(
        b[contact_display_order] || getContactTitle(b)
      )
    )
    .reduce((acc, contact) => {
      const firstLetter = getFirstLetter(
        contact[contact_display_order] ||
          formatName({ contact, format: contact_display_format }),
        '#'
      );

      return {
        ...acc,
        [firstLetter]: [...(acc[firstLetter] || []), contact],
      };
    }, {});

  const firstLettersWithContacts = Object.keys(contactsGroupedByLetter);
  const firstLetters = getNavLetter(sortDir);

  return (
    <div className="m-contact-list">
      <Nav
        sortDir={sortDir}
        firstLettersWithContacts={firstLettersWithContacts}
      />
      <div className="m-contact-list__list">
        {userContact && (
          <div className="m-contact-list__group">
            <Title caps hr size="large" className="m-contact-list__alpha-title">
              <Trans id="contact-book.my-contact-details">Mes coordonées</Trans>
            </Title>
            <ContactItem
              className="m-contact-list__contact"
              contact={userContact}
              selectDisabled
              onClickContact={onClickContact}
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
                    isContactSelected={
                      selectedContactsIds &&
                      selectedContactsIds.includes(contact.contact_id)
                    }
                    selectDisabled={mode === MODE_ASSOCIATION}
                  />
                ))}
              </div>
            )
        )}
      </div>
    </div>
  );
}

export default withI18n()(ContactList);

// XXX: pattern experimentation, does static component funct easy to use in the child?
// may be an anti-pattern
export const isLoadingSelector = (state: RootState) => {
  return (
    contactStateSelector(state).status === 'pending' ||
    userStore.stateSelector(state).status === 'pending'
  );
};
