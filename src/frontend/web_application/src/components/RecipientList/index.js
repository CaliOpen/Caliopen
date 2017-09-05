import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslator } from '@gandi/react-translate';
import Presenter from './presenter';
import { setRecipientSearchTerms } from '../../store/modules/draft-message';
import { suggest as participantSuggest } from '../../store/modules/participant-suggestions';

const findRecipient = (recipients, { address, protocol }) => recipients.find(recipient =>
  recipient.address === address && recipient.protocol === protocol
);

const searchTermsSelector = (state, ownProps) =>
  state.draftMessage.recipientSearchTermsByInternalId[ownProps.internalId];

const participantSuggestionsSelector = state => state.participantSuggestions;

const recipientsSelector = (state, ownProps) => ownProps.recipients;

const mapStateToProps = createSelector(
  [
    participantSuggestionsSelector,
    searchTermsSelector,
    recipientsSelector,
  ],
  (participantSuggestions, searchTerms, recipients) => {
    const { isFetching, resultsBySearchTerms } = participantSuggestions;
    const searchResults = (resultsBySearchTerms[searchTerms] && resultsBySearchTerms[searchTerms]
      .filter(identity => !findRecipient(recipients, identity))) || [];

    return {
      isFetching,
      searchResults,
      searchTerms,
    };
  }
);

const mapDispatchToProps = dispatch => bindActionCreators({
  setSearchTerms: setRecipientSearchTerms,
  search: participantSuggest,
}, dispatch);

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTranslator()
)(Presenter);
