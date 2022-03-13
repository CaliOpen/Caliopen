import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { userSelector } from 'src/modules/user';
import {
  loadMore,
  invalidate,
  deleteMessage as deleteMessageRaw,
} from '../../store/modules/message';
import {
  setMessageRead,
  deleteMessage,
  requestDiscussion,
  sortMessages,
  getLastMessageFromArray,
  getDraft,
} from '../../modules/message';
import { reply, draftMessagesSelector } from '../../modules/draftMessage';
import { createMessageCollectionStateSelector } from '../../store/selectors/message';
import { withTags, updateTagCollection } from '../../modules/tags';
import { getUser } from '../../modules/user/actions/getUser';
import { withPush } from '../../modules/routing/hoc/withPush';
import Discussion from './presenter';

const getDiscussionIdFromProps = (props) => props.match.params.discussionId;
// FIXME: bad selector, coupling w/ location
const discussionIdSelector = (state, ownProps) =>
  getDiscussionIdFromProps(ownProps);
const discussionStateSelector = (state) => state.discussion;

const messageByIdSelector = (state) => state.message.messagesById;
const messageCollectionStateSelector = createMessageCollectionStateSelector(
  () => 'discussion',
  discussionIdSelector
);
const sortedMessagesSelector = createSelector(
  [messageByIdSelector, messageCollectionStateSelector],
  (messagesById, { messageIds }) =>
    sortMessages(
      messageIds
        .map((messageId) => messagesById[messageId])
        .filter((msg) => msg.is_draft === false),
      false
    )
);

const lastMessageSelector = createSelector(
  [sortedMessagesSelector],
  (sortedMessages) => getLastMessageFromArray(sortedMessages)
);
const firstUnreadMessageSelector = createSelector(
  [sortedMessagesSelector],
  (sortedMessages) => sortedMessages.filter((message) => message.is_unread)[0]
);

const draftMessageSelector = createSelector(
  [
    messageByIdSelector,
    messageCollectionStateSelector,
    draftMessagesSelector,
    discussionIdSelector,
  ],
  (messagesById, { messageIds }, draftMessages, discussionId) => {
    const draftMessage = draftMessages.find(
      (draft) => draft.discussion_id === discussionId
    );
    if (draftMessage) {
      return draftMessage;
    }

    if (messageIds.length === 0) {
      return undefined;
    }

    const message = sortMessages(
      messageIds
        .filter(
          (messageId) =>
            messagesById[messageId] && messagesById[messageId].is_draft
        )
        .map((messageId) => messagesById[messageId]),
      false
    ).pop();

    return message;
  }
);

// actual saved drafts for the discussion
const messagesDraftByDiscussionIdSelector = createSelector(
  [
    (state) => state.message.messagesById,
    (_, { discussionId }) => discussionId,
  ],
  (messagesByIdState, discussionId) =>
    Object.keys(messagesByIdState)
      .filter(
        (id) =>
          messagesByIdState[id]?.is_draft &&
          messagesByIdState[id]?.discussion_id === discussionId
      )
      .map((id) => messagesByIdState[id])
);

const mapStateToProps = createSelector(
  [
    sortedMessagesSelector,
    lastMessageSelector,
    firstUnreadMessageSelector,
    messageByIdSelector,
    discussionStateSelector,
    discussionIdSelector,
    userSelector,
    messageCollectionStateSelector,
    draftMessageSelector,
  ],
  (
    sortedMessages,
    lastMessage,
    firstUnreadMessage,
    messagesById,
    discussionState,
    discussionId,
    userState,
    { didInvalidate, messageIds, hasMore, isFetching },
    draftMessage
  ) => {
    const canBeClosed = messageIds.length === 0;

    return {
      discussionId,
      user: userState.user,
      isUserFetching: userState.isFetching,
      discussion: discussionState.discussionsById[discussionId],
      messages: sortedMessages,
      isFetching,
      didInvalidate,
      hasMore,
      canBeClosed,
      lastMessage,
      firstUnreadMessage,
      draftMessage,
    };
  }
);

const deleteDiscussion =
  ({ discussionId, messages }) =>
  async (dispatch) => {
    await Promise.all(
      messages.map((message) => dispatch(deleteMessageRaw({ message })))
    );

    return dispatch(invalidate('discussion', discussionId));
  };

const updateDiscussionTags =
  ({ i18n, messages, tags }) =>
  async (dispatch) =>
    Promise.all(
      messages.map((message) =>
        dispatch(
          updateTagCollection(i18n, { type: 'message', entity: message, tags })
        )
      )
    );

const onMessageReply = (message) => async (dispatch) => {
  dispatch(reply(message));
};

const requestDiscussionAndDraft =
  ({ discussionId }) =>
  async (dispatch, getState) => {
    const discussion = await dispatch(requestDiscussion({ discussionId }));
    const draftMessage = messagesDraftByDiscussionIdSelector(getState(), {
      discussionId,
    }).pop();

    if (!draftMessage) {
      await dispatch(getDraft({ discussionId }));
    }

    return discussion;
  };

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators(
    {
      loadMore: loadMore.bind(
        null,
        'discussion',
        getDiscussionIdFromProps(ownProps)
      ),
      setMessageRead,
      deleteMessage,
      deleteDiscussion,
      requestDiscussion: requestDiscussionAndDraft.bind(null, {
        discussionId: getDiscussionIdFromProps(ownProps),
      }),
      updateDiscussionTags,
      onMessageReply,
      getUser,
    },
    dispatch
  );

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTags(),
  withPush()
)(Discussion);
