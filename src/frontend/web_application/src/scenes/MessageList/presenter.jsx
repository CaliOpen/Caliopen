import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MessageListBase from '../../components/MessageList';
import ReplyForm from './components/DraftForm';

class MessageList extends Component {
  static propTypes = {
    requestMessages: PropTypes.func.isRequired,
    requestDiscussion: PropTypes.func.isRequired,
    invalidateDiscussion: PropTypes.func.isRequired,
    discussionId: PropTypes.string.isRequired,
    messages: PropTypes.arrayOf(PropTypes.shape({})),
    messagesDidInvalidate: PropTypes.bool.isRequired,
    setMessageRead: PropTypes.func.isRequired,
    deleteMessage: PropTypes.func.isRequired,
    removeTab: PropTypes.func.isRequired,
    currentTab: PropTypes.shape({}),
  };

  static defaultProps = {
    messages: [],
    discussion: {},
    currentTab: undefined,
  };

  componentDidMount() {
    const { discussionId } = this.props;
    this.props.requestMessages({ discussionId });
    this.props.requestDiscussion({ discussionId });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.messagesDidInvalidate) {
      this.props.requestMessages({ discussionId: nextProps.discussionId });
    }
  }

  handleViewMessage = ({ message }) => {
    this.props.setMessageRead({ message, isRead: true });
  };

  handleDeleteMessage = ({ message }) => {
    const {
      deleteMessage, invalidateDiscussion, requestMessages, removeTab, discussionId, currentTab,
    } = this.props;
    deleteMessage({ message })
      .then(() => invalidateDiscussion({ discussionId }))
      .then(() => requestMessages({ discussionId }))
      .then(
        ({ payload: { data } }) => data.messages.length === 0 && removeTab(currentTab)
      );
  };

  handleDelete = () => {
    const {
      messages, deleteMessage, invalidateDiscussion, requestMessages, removeTab, discussionId,
      currentTab,
    } = this.props;
    Promise.all(messages.map(message => deleteMessage({ message })))
      .then(() => invalidateDiscussion({ discussionId }))
      .then(() => requestMessages({ discussionId }))
      .then(
        ({ payload: { data } }) => data.messages.length === 0 && removeTab(currentTab)
      );
  };

  render() {
    const { messages, discussionId } = this.props;

    return (
      <MessageListBase
        messages={messages}
        onMessageView={this.handleViewMessage}
        replyForm={<ReplyForm discussionId={discussionId} internalId={discussionId} />}
        onReply={() => {}}
        onForward={() => {}}
        onDelete={this.handleDelete}
        onMessageDelete={this.handleDeleteMessage}
      />
    );
  }
}

export default MessageList;
