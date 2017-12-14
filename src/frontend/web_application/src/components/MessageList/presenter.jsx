import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../Button';
import MenuBar from '../MenuBar';
import Spinner from '../Spinner';
import DayMessageList from './components/DayMessageList';
import Message from './components/Message';
import groupMessages from './services/groupMessages';
import { isMessageFromUser } from '../../services/message';

import './style.scss';

class MessageList extends Component {
  static propTypes = {
    isFetching: PropTypes.bool,
    loadMore: PropTypes.node,
    onMessageRead: PropTypes.func.isRequired,
    onMessageUnread: PropTypes.func.isRequired,
    onMessageDelete: PropTypes.func.isRequired,
    onMessageReply: PropTypes.func.isRequired,
    onMessageCopyTo: PropTypes.func.isRequired,
    onMessageEditTags: PropTypes.func.isRequired,
    onForward: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    messages: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    replyForm: PropTypes.node.isRequired,
    user: PropTypes.shape({}),
    __: PropTypes.func.isRequired,
  };

  static defaultProps = {
    isFetching: false,
    loadMore: null,
    onMessageView: null,
    user: undefined,
  };

  state = {
    anchor: '',
  }

  handleReplyToLastMessage = () => {
    const { messages, onMessageReply } = this.props;
    const message = messages[messages.length - 1];

    return onMessageReply({ message });
  };

  renderDayGroups() {
    const {
      messages, onMessageRead, onMessageUnread, onMessageDelete, onMessageReply, onMessageCopyTo,
      onMessageEditTags, __, user,
    } = this.props;

    const messagesGroupedByday = groupMessages(messages, user);

    return Object.keys(messagesGroupedByday)
      .map(date => (
        <DayMessageList key={date} date={date}>
          {messagesGroupedByday[date].map(message => (
            <Message
              key={message.message_id}
              message={message}
              isMessageFromUser={(user && isMessageFromUser(message, user)) || false}
              className="m-message-list__message"
              onMessageRead={onMessageRead}
              onMessageUnread={onMessageUnread}
              onDelete={onMessageDelete}
              onReply={onMessageReply}
              onCopyTo={onMessageCopyTo}
              onEditTags={onMessageEditTags}
              __={__}
            />
          ))}
        </DayMessageList>
      ));
  }

  render() {
    const { isFetching, loadMore, onDelete, replyForm, __ } = this.props;

    return (
      <div className="m-message-list">
        <MenuBar>
          <Button className="m-message-list__action" onClick={this.handleReplyToLastMessage} icon="reply" responsive="icon-only" >{__('message-list.action.reply')}</Button>
          {/*
            <Button className="m-message-list__action" onClick={onForward} icon="share"
            responsive="icon-only" >{__('message-list.action.copy-to')}</Button>
          */}
          <Button className="m-message-list__action" onClick={onDelete} icon="trash" responsive="icon-only" >{__('message-list.action.delete')}</Button>
          <Spinner isLoading={isFetching} className="m-message-list__spinner" />
        </MenuBar>
        <div className="m-message-list__load-more">
          {loadMore}
        </div>
        <div className="m-message-list__list">
          {this.renderDayGroups()}
        </div>
        <div className="m-message-list__reply">
          {replyForm}
        </div>
      </div>
    );
  }
}

export default MessageList;
