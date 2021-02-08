import { createSelector } from 'reselect';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { getModuleStateSelector } from '../../../../store/selectors/getModuleStateSelector';
import Presenter from './presenter';

const participantSelector = (state, ownProps) => ownProps.participant;
const mapStateToProps = createSelector(
  [participantSelector, getModuleStateSelector('contact')],
  (participant, contactState) => ({
    // a participant can be associated to only one participant
    contact:
      participant.contact_ids &&
      contactState.contactsById[participant.contact_ids[0]],
  })
);

export default compose(connect(mapStateToProps))(Presenter);
