import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Trans } from 'lingui-react';
import { Button, Modal, Confirm } from '../../../../components';
import { ManageEntityTags } from '../../../../modules/tags';

import './style.scss';

class DraftMessageActionsContainer extends Component {
  static propTypes = {
    i18n: PropTypes.shape({}).isRequired,
    internalId: PropTypes.string,
    message: PropTypes.shape({}),
    onDelete: PropTypes.func.isRequired,
    onTagsChange: PropTypes.func.isRequired,
    className: PropTypes.string,
  };

  static defaultProps = {
    internalId: undefined,
    message: undefined,
    className: null,
  };

  state = {
    isRead: false,
  }

  makeHandle = action => () => {
    const { message, internalId } = this.props;
    action({ message, internalId });
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

  renderTagsModal = () => {
    const { message, i18n, onTagsChange } = this.props;
    const nb = (message && message.tags) ? message.tags.length : 0;
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

  renderDeleteButton() {
    const { message, onDelete } = this.props;

    if (!message || !message.message_id) {
      return (
        <Button
          onClick={confirm}
          icon="trash"
          responsive="icon-only"
          disabled
        ><Trans id="message-list.message.action.delete">Delete</Trans></Button>
      );
    }

    return (
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
    );
  }

  render() {
    const { className } = this.props;
    const messageActionsContainerClassName = classnames(
      'm-message-actions-container',
      className,
    );

    return (
      <div className={messageActionsContainerClassName}>
        <Button
          onClick={this.handleOpenTags}
          className="m-message-actions-container__action"
          icon="tags"
          responsive="icon-only"
        ><Trans id="message-list.message.action.tags">Tags</Trans></Button>
        {this.renderDeleteButton()}
        {this.renderTagsModal()}
      </div>
    );
  }
}

export default DraftMessageActionsContainer;
