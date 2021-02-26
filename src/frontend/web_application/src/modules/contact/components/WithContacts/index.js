import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import Presenter from './presenter';
import { stateSelector, requestContacts } from '../store';

const mapStateToProps = createSelector(
  [stateStateSelector],
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
