import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { identitiesSelector } from '../../../identity';
import { getIdentityProtocol } from '../../services/getIdentityProtocol';
import Presenter from './presenter';

const contactIdSelector = (state, { contactId }) => contactId;
const contactStateSelector = (state) => state.contact;

const mapStateToProps = createSelector(
  [contactIdSelector, contactStateSelector, identitiesSelector],
  (contactId, contactState, identities) => ({
    contact: contactState.contactsById[contactId],
    availableProtocols: identities.map((identity) =>
      getIdentityProtocol(identity)
    ),
  })
);
const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default compose(connect(mapStateToProps, mapDispatchToProps))(Presenter);
