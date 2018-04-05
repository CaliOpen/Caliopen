import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Trans, withI18n } from 'lingui-react';
import { Button, Modal, Confirm } from '../../../../components';
import { ManageEntityTags } from '../../../../modules/tags';

import './style.scss';

function generateStateFromProps(props) {
  const { message } = props;

  return { isRead: !message.is_unread };
}

@withI18n()
class MessageActionsContainer extends Component {
  static propTypes = {
    i18n: PropTypes.shape({}).isRequired,
    message: PropTypes.shape({}).isRequired,
    onDelete: PropTypes.func.isRequired,
    onMessageUnread: PropTypes.func.isRequired,
    onMessageRead: PropTypes.func.isRequired,
    onTagsChange: PropTypes.func.isRequired,
    onReply: PropTypes.func.isRequired,
    onCopyTo: PropTypes.func.isRequired,
    className: PropTypes.string,
  };

  static defaultProps = {
    className: null,
  };

  state = {
    isRead: false,
    isTagModalOpen: false,
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

  handleOpenTags = () => {
    this.setState(prevState => ({
      ...prevState,
      isTagModalOpen: true,
    }));
  }

  handleCloseTags = () => {
    this.setState(prevState => ({
      ...prevState,
      isTagModalOpen: false,
    }));
  }

  handleReply = () => {
    const { onReply, message } = this.props;
    onReply({ message });
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

  renderTagsModal = () => {
    const { message, i18n, onTagsChange } = this.props;
    const nb = message.tags ? message.tags.length : 0;
    const title = (
      <Trans
        id="tags.header.title"
        defaults={'Tags <0>(Total: {nb})</0>'}
        values={{ nb }}
        components={[
          (<span className="m-tags-form__count" />),
        ]}
      />
    );

    return (
      <Modal
        isOpen={this.state.isTagModalOpen}
        contentLabel={i18n._('tags.header.label', { defaults: 'Tags' })}
        title={title}
        onClose={this.handleCloseTags}
      >
        <ManageEntityTags type="message" entity={message} onChange={onTagsChange} />
      </Modal>
    );
  }

  render() {
    const { onDelete, onCopyTo, className } = this.props;
    const messageActionsContainerClassName = classnames(
      'm-message-actions-container',
      className,
    );

    return (
      <div className={messageActionsContainerClassName}>
        <Button onClick={this.handleReply} className="m-message-actions-container__action" icon="reply" responsive="icon-only"><Trans id="message-list.message.action.reply">Reply</Trans></Button>
        <Button onClick={this.makeHandle(onCopyTo)} className="m-message-actions-container__action" icon="share" responsive="icon-only"><Trans id="message-list.message.action.copy-to">Copy to</Trans></Button>
        <Button onClick={this.handleOpenTags} className="m-message-actions-container__action" icon="tags" responsive="icon-only"><Trans id="message-list.message.action.tags">Tags</Trans></Button>
        <Confirm
          className="m-message-actions-container__action"
          onConfirm={this.makeHandle(onDelete)}
          title={(<Trans id="message-list.message.confirm-delete.title">Delete a message</Trans>)}
          content={(<Trans id="message-list.message.confirm-delete.content">The deletion is permanent, are you sure you want to delete this message ?</Trans>)}
          render={confirm => (
            <Button
              onClick={confirm}
              icon="trash"
              responsive="icon-only"
            ><Trans id="message-list.message.action.delete">Delete</Trans></Button>
          )}
        />
        <Button
          className="m-message-actions-container__action"
          onClick={this.handleToggle}
        >
          {!this.state.isRead ? (
            <Trans id="message-list.message.action.mark_as_read">Mark as read</Trans>
          ) : (
            <Trans id="message-list.message.action.mark_as_unread">Mark as unread</Trans>
          )}
        </Button>
        {this.renderTagsModal()}
      </div>
    );
  }
}

export default MessageActionsContainer;
