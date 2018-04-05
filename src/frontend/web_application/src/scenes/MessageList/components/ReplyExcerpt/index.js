import { createSelector } from 'reselect';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withI18n } from 'lingui-react';
import { createMessageCollectionStateSelector } from '../../../../store/selectors/message';
import Presenter from './presenter';

const messageDraftSelector = state => state.draftMessage.draftsByInternalId;
const discussionIdSelector = (state, ownProps) => ownProps.discussionId;
const internalIdSelector = (state, ownProps) => ownProps.internalId;
const messageCollectionStateSelector = createMessageCollectionStateSelector(() => 'discussion', discussionIdSelector);

const mapStateToProps = createSelector(
  [
    messageDraftSelector, internalIdSelector, messageCollectionStateSelector,
  ],
  (drafts, internalId, { messages }) => {
    const message = messages && messages.find(item => item.is_draft === true);
    const draft = drafts[internalId] || message;

    return {
      draft,
    };
  }
);

export default compose(
  connect(mapStateToProps),
  withI18n()
)(Presenter);
