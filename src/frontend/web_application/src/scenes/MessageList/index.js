import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslator } from '@gandi/react-translate';
import { matchPath } from 'react-router-dom';
import { push } from 'react-router-redux';
import { createNotification, NOTIFICATION_TYPE_INFO } from 'react-redux-notify';
import { requestMessages, postActions, deleteMessage, loadMore, hasMore as getHasMore, replyToMessage } from '../../store/modules/message';
import { removeTab, updateTab } from '../../store/modules/tab';
import Presenter from './presenter';

const getDiscussionIdFromProps = props => props.match.params.discussionId;

const messageByIdSelector = state => state.message.messagesById;
const discussionIdSelector = (state, ownProps) => getDiscussionIdFromProps(ownProps);
const currentTabSelector = createSelector(
  [state => state.tab.tabs, state => state.router.location && state.router.location.pathname],
  (tabs, pathname) => tabs.find(tab => matchPath(pathname, { path: tab.pathname, exact: true }))
);
const messageCollectionStateSelector = createSelector(
  [state => state.message.messagesCollections, discussionIdSelector],
  (collections, discussionId) => ({
    messageIds: (
      collections.discussion &&
      collections.discussion[discussionId] &&
      collections.discussion[discussionId].messages) || [],
    didInvalidate: (
      collections.discussion &&
      collections.discussion[discussionId] &&
      collections.discussion[discussionId].didInvalidate) || false,
    hasMore: (
      collections.discussion &&
      collections.discussion[discussionId] &&
      getHasMore(collections.discussion[discussionId])) || false,
    isFetching: (
      collections.discussion &&
      collections.discussion[discussionId] &&
      collections.discussion[discussionId].isFetching) || false,
  })
);

const mapStateToProps = createSelector(
  [messageByIdSelector, discussionIdSelector, currentTabSelector, messageCollectionStateSelector],
  (messagesById, discussionId, currentTab, { didInvalidate, messageIds, hasMore, isFetching }) => {
    const messages = messageIds.map(messageId => messagesById[messageId]);

    return {
      discussionId,
      didInvalidate,
      isFetching,
      hasMore,
      messages: messages.filter(message => message.is_draft !== true),
      hasDraft: messages.some(message => message.is_draft),
      currentTab,
    };
  }
);

const notif = createNotification({
  message: 'Functionnality is not yet available',
  type: NOTIFICATION_TYPE_INFO,
  duration: 10000,
  canDismiss: true,
});

const mapDispatchToProps = (dispatch, ownProps) => bindActionCreators({
  requestMessages: requestMessages.bind(null, 'discussion', getDiscussionIdFromProps(ownProps)),
  loadMore: loadMore.bind(null, 'discussion', getDiscussionIdFromProps(ownProps)),
  deleteMessage,
  setMessageRead: ({ message, isRead = true }) => {
    const action = isRead ? 'set_read' : 'set_unread';

    return postActions({ message, actions: [action] });
  },
  removeTab,
  updateTab,
  replyToMessage,
  copyMessageTo: () => notif,
  editMessageTags: () => notif,
  push,
}, dispatch);

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTranslator()
)(Presenter);
