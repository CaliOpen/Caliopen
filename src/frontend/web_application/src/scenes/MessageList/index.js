import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withI18n } from 'lingui-react';
import { push } from 'react-router-redux';
import { createNotification, NOTIFICATION_TYPE_INFO } from 'react-redux-notify';
import { createMessageCollectionStateSelector } from '../../store/selectors/message';
import { requestMessages, loadMore } from '../../store/modules/message';
import { removeTab, updateTab } from '../../store/modules/tab';
import { clearDraft } from '../../store/modules/draft-message';
import { updateTagCollection, withTags } from '../../modules/tags';
import { setMessageRead, deleteMessage } from '../../modules/message';
import { reply } from '../../modules/draftMessage';
import withScrollManager from '../../modules/scroll/hoc/scrollManager';
import { sortMessages } from '../../services/message';
import Presenter from './presenter';

const getDiscussionIdFromProps = props => props.match.params.discussionId;

const messageByIdSelector = state => state.message.messagesById;
const discussionIdSelector = (state, ownProps) => getDiscussionIdFromProps(ownProps);
const messageCollectionStateSelector = createMessageCollectionStateSelector(() => 'discussion', discussionIdSelector);

const mapStateToProps = createSelector(
  [messageByIdSelector, discussionIdSelector, messageCollectionStateSelector],
  (messagesById, discussionId, {
    didInvalidate, messageIds, hasMore, isFetching,
  }) => {
    const messages = sortMessages(messageIds.map(messageId => messagesById[messageId]), false);

    return {
      discussionId,
      didInvalidate,
      isFetching,
      hasMore,
      messages,
    };
  }
);

// customStyles applied to Notification component
const customStyles = {
  'has-close': 'l-notification-center__notification--has-close',
  'has-close-all': 'l-notification-center__notification--has-close-all',
  item__message: 'l-notification-center__notification-item-message',
};

const notif = createNotification({
  message: 'Functionnality is not yet available',
  type: NOTIFICATION_TYPE_INFO,
  duration: 10000,
  canDismiss: true,
  customStyles,
});

const onDeleteMessage = ({ message }) => dispatch =>
  dispatch(deleteMessage({ message }))
    .then(() => {
      if (!message.is_draft) {
        return undefined;
      }

      return dispatch(clearDraft({ internalId: message.discussion_id }));
    });

const onReplyMessage = ({ message }) => (dispatch) => {
  dispatch(reply({ internalId: message.discussion_id, message }));
  dispatch(push({ hash: 'reply' }));
};

const mapDispatchToProps = (dispatch, ownProps) => bindActionCreators({
  requestMessages: requestMessages.bind(null, 'discussion', getDiscussionIdFromProps(ownProps)),
  loadMore: loadMore.bind(null, 'discussion', getDiscussionIdFromProps(ownProps)),
  deleteMessage: onDeleteMessage,
  setMessageRead,
  removeTab,
  updateTab,
  replyToMessage: onReplyMessage,
  copyMessageTo: () => notif,
  push,
  updateTagCollection,
}, dispatch);

export default compose(
  withTags(),
  connect(mapStateToProps, mapDispatchToProps),
  withI18n(),
  withScrollManager(),
)(Presenter);
