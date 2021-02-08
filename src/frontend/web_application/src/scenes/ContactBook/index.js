import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { deleteContacts } from '../../modules/contact';
import { withUser } from '../../modules/user';
import { updateContactTags } from '../../modules/tags';

import {
  requestContacts,
  loadMoreContacts,
  hasMore,
} from '../../store/modules/contact';
import Presenter from './presenter';

const contactStateSelector = (state) => state.contact;
const userSelector = (state, ownProps) => ownProps.userState.user;
const contactsExceptUserSelector = createSelector(
  [contactStateSelector, userSelector],
  (contactState, user) =>
    contactState.contacts
      .filter((contactId) => !user || contactId !== user.contact.contact_id)
      .map((contactId) => contactState.contactsById[contactId])
);
const mapStateToProps = createSelector(
  [contactStateSelector, contactsExceptUserSelector, userSelector],
  (contactState, contacts, user) => {
    const userContact = user && user.contact;

    return {
      contacts,
      isFetching: contactState.isFetching,
      didInvalidate: contactState.didInvalidate,
      hasMore: hasMore(contactState),
      userContact,
    };
  }
);
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      requestContacts,
      loadMoreContacts,
      deleteContacts,
      updateContactTags,
    },
    dispatch
  );

export default compose(
  withUser(),
  connect(mapStateToProps, mapDispatchToProps)
)(Presenter);
