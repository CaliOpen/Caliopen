import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import Presenter from './presenter';
import { contactStateSelector } from '../../../../store/selectors/contact';
import { requestContacts } from '../../../../store/modules/contact';

const mapStateToProps = createSelector(
  [contactStateSelector],
  ({ contacts, contactsById, isFetching, didInvalidate }) => ({
    contacts: contacts.map((contactId) => contactsById[contactId]),
    isFetching,
    didInvalidate,
  })
);

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      requestContacts,
    },
    dispatch
  );

export default compose(connect(mapStateToProps, mapDispatchToProps))(Presenter);
