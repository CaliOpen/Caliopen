import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withI18n } from 'lingui-react';
import { requestContacts, loadMoreContacts, hasMore } from '../../store/modules/contact';
import withScrollManager from '../../modules/scroll/hoc/scrollManager';
import Presenter from './presenter';

const contactSelector = state => state.contact;
const mapStateToProps = createSelector(
  [contactSelector],
  contactState => ({
    contacts: contactState.contacts.map(contactId => contactState.contactsById[contactId]),
    isFetching: contactState.isFetching,
    hasMore: hasMore(contactState),
  })
);
const mapDispatchToProps = dispatch => bindActionCreators({
  requestContacts,
  loadMoreContacts,
}, dispatch);

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withScrollManager(),
  withI18n(),
)(Presenter);
