import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { useHistory, useParams } from 'react-router-dom';
import { Trans, withI18n, withI18nProps } from '@lingui/react';
import { PageTitle, Button, ActionBar } from 'src/components';
import { loadMoreContacts } from 'src/modules/contact';
import { ContactPayload } from 'src/modules/contact/types';
import { requestContacts, hasMore } from 'src/modules/contact/store/reducer';
import { useSearchParams } from 'src/modules/routing';
import { useCloseTab, useCurrentTab } from 'src/modules/tab';
import { userSelector } from 'src/modules/user';
import { UserPayload } from 'src/modules/user/types';
import { RootState } from 'src/store/reducer';
import ContactList from 'src/scenes/ContactBook/components/ContactList';
import './contact-association.scss';

const contactStateSelector = (state: RootState) => state.contact;

type ContactsExceptUserSelected = ContactPayload[];
const contactsExceptUserSelector = createSelector<
  RootState,
  RootState['contact'],
  UserPayload | undefined,
  ContactsExceptUserSelected
>([contactStateSelector, userSelector], (contactState, user) =>
  contactState.contacts
    .filter((contactId) => contactId !== user?.contact.contact_id)
    .map((contactId) => contactState.contactsById[contactId])
);

interface Props extends withI18nProps {}
function ContactAssociation({ i18n }: Props) {
  const dispatch = useDispatch();
  const didInvalidate = useSelector<RootState, boolean>(
    (state) => state.contact.didInvalidate
  );
  const isFetching = useSelector<RootState, boolean>(
    (state) => state.contact.isFetching
  );
  const contacts = useSelector<RootState, ContactsExceptUserSelected>(
    contactsExceptUserSelector
  );
  const user = useSelector<RootState, undefined | UserPayload>(userSelector);

  React.useEffect(() => {
    dispatch(requestContacts());
  }, []);

  React.useEffect(() => {
    if (didInvalidate && !isFetching) {
      dispatch(requestContacts());
    }
  }, [didInvalidate, isFetching]);

  const closeTab = useCloseTab();
  const currentTab = useCurrentTab();
  const { push } = useHistory();
  const { address, protocol } = useParams<{
    address: string;
    protocol: string;
  }>();
  const { label } = useSearchParams();

  const handleClickContact = ({ contact }) => {
    push(
      `/contacts/${contact.contact_id}/edit?address=${address}&protocol=${protocol}&label=${label}`
    );
    closeTab(currentTab);
  };

  const handleClickNewContact = () => {
    push(`/new-contact?address=${address}&protocol=${protocol}&label=${label}`);
    closeTab(currentTab);
  };

  const loadMore = () => {
    dispatch(loadMoreContacts());
  };

  return (
    <div className="s-contact-association">
      <PageTitle
        title={i18n._('header.menu.contact-association', undefined, {
          defaults: 'Contact association',
        })}
      />
      <ActionBar
        hr={false}
        isLoading={isFetching}
        actionsNode={
          <div className="s-contact-book-menu s-contact-association__action-bar">
            <Button
              className="s-contact-book-menu__action-btn"
              display="inline"
              noDecoration
              icon="plus"
              onClick={handleClickNewContact}
            >
              <Trans id="contact-association.action.add-new-contact">
                Add new contact
              </Trans>
            </Button>
          </div>
        }
      />
      <>
        <ContactList
          contacts={contacts}
          userContact={user?.contact}
          onClickContact={handleClickContact}
          mode="association"
        />
        {hasMore && (
          <div className="s-contact-book-list__load-more">
            <Button shape="hollow" onClick={loadMore}>
              <Trans id="general.action.load_more">Load more</Trans>
            </Button>
          </div>
        )}
      </>
    </div>
  );
}

export default withI18n()(ContactAssociation);
