import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { withTranslator } from '@gandi/react-translate';
import { withNotification } from '../../../../hoc/notification';
import { createMessageCollectionStateSelector } from '../../../../store/selectors/message';
import { editDraft, requestDraft, saveDraft, sendDraft, clearDraft } from '../../../../store/modules/draft-message';
import { deleteMessage } from '../../../../store/modules/message';
import { getLastMessage } from '../../../../services/message';
import Presenter from './presenter';

const messageDraftSelector = state => state.draftMessage.draftsByInternalId;
const discussionIdSelector = (state, ownProps) => ownProps.discussionId;
const internalIdSelector = (state, ownProps) => ownProps.internalId;
const userSelector = state => state.user.user;
const messageCollectionStateSelector = createMessageCollectionStateSelector(() => 'discussion', discussionIdSelector);

const mapStateToProps = createSelector(
  [
    messageDraftSelector, discussionIdSelector, internalIdSelector, messageCollectionStateSelector,
    userSelector,
  ],
  (drafts, discussionId, internalId, { messages }, user) => {
    const message = messages && messages.find(item => item.is_draft === true);
    const sentMessages = messages.filter(item => item.is_draft !== true);
    const lastMessage = getLastMessage(sentMessages);
    const draft = drafts[internalId] || message;
    const parentMessage = draft && sentMessages
      .find(item => item.message_id === draft.parent_id && item !== lastMessage);

    return {
      allowEditRecipients: messages.length === 1 && message && true,
      message,
      parentMessage,
      draft,
      discussionId,
      user,
    };
  }
);

const onDeleteMessage = ({ message, internalId, isNewDiscussion }) => dispatch =>
  dispatch(deleteMessage({ message }))
    .then(() => dispatch(clearDraft({ internalId })))
    .then(() => isNewDiscussion && dispatch(push('/')));

const onSaveDraft = ({ internalId, draft, message }, ownProps) => dispatch =>
  dispatch(saveDraft({ internalId, draft, message }))
    .then(() => {
      const { __, notifySuccess } = ownProps;

      return notifySuccess({ message: __('draft.feedback.saved') });
    });

const mapDispatchToProps = (dispatch, ownProps) => bindActionCreators({
  editDraft,
  requestDraft,
  saveDraft: params => onSaveDraft(params, ownProps),
  sendDraft,
  onDeleteMessage,
}, dispatch);

export default compose(...[
  withTranslator(),
  withNotification(),
  connect(mapStateToProps, mapDispatchToProps),
])(Presenter);
