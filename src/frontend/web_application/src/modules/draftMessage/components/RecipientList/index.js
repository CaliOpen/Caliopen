import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import Presenter from './presenter';
import { requestParticipantSuggestions } from '../../actions/requestParticipantSuggestions';
import { setRecipientSearchTerms } from '../../../../store/modules/draft-message';
import { getKey } from '../../../../store/modules/participant-suggestions';

const findRecipient = (recipients, { address, protocol }) => recipients
  .find(recipient => recipient.address === address && recipient.protocol === protocol);

const searchTermsSelector = (state, ownProps) => state.draftMessage
  .recipientSearchTermsByInternalId[ownProps.internalId];

const participantSuggestionsSelector = state => state.participantSuggestions;

const recipientsSelector = (state, ownProps) => ownProps.recipients || [];

const mapStateToProps = createSelector(
  [
    participantSuggestionsSelector,
    searchTermsSelector,
    recipientsSelector,
  ],
  (participantSuggestions, searchTerms, recipients) => {
    const { isFetching, resultsByKey } = participantSuggestions;
    const searchResults = (
      searchTerms &&
      resultsByKey[getKey(searchTerms)] &&
      resultsByKey[getKey(searchTerms)].filter(identity => !findRecipient(recipients, identity))
    ) || [];

    return {
      isFetching,
      searchResults,
      searchTerms,
    };
  }
);

const mapDispatchToProps = dispatch => bindActionCreators({
  setSearchTerms: setRecipientSearchTerms,
  search: requestParticipantSuggestions,
}, dispatch);

export default compose(connect(mapStateToProps, mapDispatchToProps))(Presenter);
