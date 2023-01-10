import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Trans, withI18n, withI18nProps } from '@lingui/react';
import { PageTitle, Button, ActionBar } from 'src/components';
import {
  ContactList,
  useContactsIsFetching,
  useContacts,
} from 'src/modules/contact';
import { Contact } from 'src/modules/contact/types';
import { useSearchParams } from 'src/modules/routing';
import { useCloseTab, useCurrentTab } from 'src/modules/tab';

import './contact-association.scss';

type Props = withI18nProps;

function ContactAssociation({ i18n }: Props) {
  const isLoading = useContactsIsFetching();
  const closeTab = useCloseTab();
  const currentTab = useCurrentTab();
  const { push } = useHistory();
  const { address, protocol } = useParams<{
    address: string;
    protocol: string;
  }>();
  const { label } = useSearchParams();
  const { data: contacts } = useContacts();

  const handleClickContact = (contact: Contact) => {
    push(
      `/contacts/${contact.contact_id}/edit?address=${address}&protocol=${protocol}&label=${label}`
    );
    closeTab(currentTab);
  };

  const handleClickNewContact = () => {
    push(`/new-contact?address=${address}&protocol=${protocol}&label=${label}`);
    closeTab(currentTab);
  };

  return (
    <div className="s-contact-association">
      <PageTitle
        title={i18n._(/* i18n */ 'header.menu.contact-association', undefined, {
          message: 'Contact association',
        })}
      />
      <ActionBar
        hr={false}
        isLoading={isLoading}
        actionsNode={
          <div className="s-contact-book-menu s-contact-association__action-bar">
            <Button
              className="s-contact-book-menu__action-btn"
              display="inline"
              noDecoration
              icon="plus"
              onClick={handleClickNewContact}
            >
              <Trans
                id="contact-association.action.add-new-contact"
                message="Add new contact"
              />
            </Button>
          </div>
        }
      />
      <ContactList
        onClickContact={handleClickContact}
        mode="association"
        contacts={contacts}
      />
    </div>
  );
}

export default withI18n()(ContactAssociation);
