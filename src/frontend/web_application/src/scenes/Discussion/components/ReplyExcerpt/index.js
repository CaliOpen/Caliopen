import { createSelector } from 'reselect';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withI18n } from '@lingui/react';
import { createMessageCollectionStateSelector } from '../../../../store/selectors/message';
import Presenter from './presenter';

const messageDraftSelector = (state) => state.draftMessage.draftsByMessageId;
const discussionIdSelector = (state, ownProps) => ownProps.discussionId;
// FIXME: no mnessageId: use withdraft instead
const messageIdSelector = (state, ownProps) => ownProps.messageId;
const messageCollectionStateSelector = createMessageCollectionStateSelector(
  () => 'discussion',
  discussionIdSelector
);

const mapStateToProps = createSelector(
  [messageDraftSelector, messageIdSelector, messageCollectionStateSelector],
  (drafts, messageId, { messages }) => {
    const message = messages && messages.find((item) => item.is_draft === true);
    const draft = drafts[messageId] || message;

    return {
      draft,
    };
  }
);

export default compose(connect(mapStateToProps), withI18n())(Presenter);
