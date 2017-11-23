import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Button from '../../../Button';
import withScrollToHash from '../../../../hoc/scrollToHash';

import './style.scss';

function generateStateFromProps(props) {
  const { message } = props;

  return { isRead: !message.is_unread };
}

@withScrollToHash()
class MessageActionsContainer extends Component {
  static propTypes = {
    message: PropTypes.shape({}).isRequired,
    onDelete: PropTypes.func.isRequired,
    onMessageUnread: PropTypes.func.isRequired,
    onMessageRead: PropTypes.func.isRequired,
    onReply: PropTypes.func.isRequired,
    onCopyTo: PropTypes.func.isRequired,
    onEditTags: PropTypes.func.isRequired,
    className: PropTypes.string,
    __: PropTypes.func.isRequired,
    scrollToHash: PropTypes.func.isRequired,
  };

  static defaultProps = {
    className: null,
  };

  state = {
    isRead: false,
  }

  componentWillMount() {
    this.setState(generateStateFromProps(this.props));
  }

  componentWillReceiveProps(nextProps) {
    this.setState(generateStateFromProps(nextProps));
  }

  makeHandle = action => () => {
    const { message } = this.props;
    action({ message });
  };

  handleReply = () => {
    const { onReply, message, scrollToHash } = this.props;
    onReply({ message });
    scrollToHash('reply');
  }

  handleToggle = () => {
    const { message, onMessageRead, onMessageUnread } = this.props;

    if (message.is_unread) { onMessageRead({ message }); }
    if (!message.is_unread) { onMessageUnread({ message }); }

    this.setState(prevState => ({
      ...prevState,
      isRead: !message.is_unread,
    }));
  }

  render() {
    const { onDelete, onCopyTo, onEditTags, className, __ } = this.props;
    const messageActionsContainerClassName = classnames(
      'm-message-actions-container',
      className,
    );

    return (
      <div className={messageActionsContainerClassName}>
        <Button onClick={this.handleReply} className="m-message-actions-container__action" display="expanded" icon="reply" responsive="icon-only">{__('message-list.message.action.reply')}</Button>
        <Button onClick={this.makeHandle(onCopyTo)} className="m-message-actions-container__action" display="expanded" icon="share" responsive="icon-only">{__('message-list.message.action.copy-to')}</Button>
        <Button onClick={this.makeHandle(onEditTags)} className="m-message-actions-container__action" display="expanded" icon="tags" responsive="icon-only">{__('message-list.message.action.tags')}</Button>
        <Button onClick={this.makeHandle(onDelete)} className="m-message-actions-container__action" display="expanded" icon="trash" responsive="icon-only">{__('message-list.message.action.delete')}</Button>
        <Button
          className="m-message-actions-container__action"
          display="expanded"
          onClick={this.handleToggle}
        >{!this.state.isRead ? __('message-list.message.action.mark_as_read') : __('message-list.message.action.mark_as_unread')}</Button>
      </div>
    );
  }
}

export default MessageActionsContainer;
