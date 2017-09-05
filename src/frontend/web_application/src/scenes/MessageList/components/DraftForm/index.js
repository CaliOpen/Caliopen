import { createSelector } from 'reselect';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { editDraft, requestDraft, saveDraft, sendDraft } from '../../../../store/modules/draft-message';
import Presenter from './presenter';

const messageDraftSelector = state => state.draftMessage.draftsByInternalId;
const discussionIdSelector = (state, ownProps) => ownProps.discussionId;
const internalIdSelector = (state, ownProps) => ownProps.internalId;
const messagesStateSelector = state => state.message.messagesById;
const userSelector = state => state.user.user;
const messagesSelector = createSelector(
  [messagesStateSelector, discussionIdSelector],
  (messages, discussionId) => Object.keys(messages)
    .map(messageId => messages[messageId])
    .filter(item => item.discussion_id === discussionId)
);

const mapStateToProps = createSelector(
  [messageDraftSelector, discussionIdSelector, internalIdSelector, messagesSelector, userSelector],
  (drafts, discussionId, internalId, messages, user) => {
    const message = messages && messages.find(item => item.is_draft === true);
    const draft = drafts[internalId] || message;

    return {
      allowEditRecipients: messages.length === 1 && message && true,
      message,
      draft,
      discussionId,
      user,
    };
  }
);

const mapDispatchToProps = dispatch => bindActionCreators({
  editDraft,
  requestDraft,
  saveDraft,
  sendDraft,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Presenter);
