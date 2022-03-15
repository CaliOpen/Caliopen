import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import { Trans, withI18n } from '@lingui/react';
import classnames from 'classnames';
import Linkify from 'linkifyjs/react';
import { ParticipantLabel } from '../../../../modules/message';
import {
  Button,
  Confirm,
  Icon,
  TextBlock,
  Callout,
} from '../../../../components';
import MessageAttachments from '../MessageAttachments';
import MessageRecipients from '../MessageRecipients';
import MessagePi from '../MessagePi';
import TagList from '../TagList';
import { LockedMessage } from '../../../../modules/encryption';
import { getAuthor, getRecipients } from '../../../../services/message';
import {
  getAveragePIMessage,
  getPiClass,
} from '../../../../modules/pi/services/pi';
import { STATUS_DECRYPTED } from '../../../../store/modules/encryption';

import './style.scss';
import './mail-message-details.scss';

@withI18n()
class MailMessage extends Component {
  static propTypes = {
    message: PropTypes.shape({
      message_id: PropTypes.string,
    }).isRequired,
    onMessageRead: PropTypes.func,
    onMessageUnread: PropTypes.func,
    onMessageDelete: PropTypes.func.isRequired,
    onOpenTags: PropTypes.func.isRequired,
    onReply: PropTypes.func.isRequired,
    settings: PropTypes.shape({ default_locale: PropTypes.string.isRequired })
      .isRequired,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    noInteractions: PropTypes.bool,
    isLocked: PropTypes.bool.isRequired,
    encryptionStatus: PropTypes.shape({}),
    // scrollToMe
    forwardedRef: PropTypes.func.isRequired,
  };

  static defaultProps = {
    onMessageRead: () => {
      // noop
    },
    onMessageUnread: () => {
      // noop
    },
    noInteractions: false,
    encryptionStatus: undefined,
  };

  handleMessageDelete = () => {
    const { message, onMessageDelete } = this.props;
    onMessageDelete({ message });
  };

  handleToggleMarkAsRead = () => {
    const { message, onMessageRead, onMessageUnread } = this.props;

    if (message.is_unread) {
      onMessageRead({ message });
    } else {
      onMessageUnread({ message });
    }
  };

  handleReply = () => {
    const { onReply, message } = this.props;

    onReply();
  };

  renderBody() {
    const { message, isLocked, encryptionStatus } = this.props;

    if (isLocked) {
      return <LockedMessage encryptionStatus={encryptionStatus} />;
    }

    if (!message.body_is_plain) {
      return (
        <TextBlock
          nowrap={false}
          className="s-mail-message__content"
          dangerouslySetInnerHTML={{ __html: message.body }}
        />
      );
    }

    return (
      <TextBlock nowrap={false}>
        <Linkify tagName="pre" className="s-mail-message__content">
          {message.body}
        </Linkify>
      </TextBlock>
    );
  }

  renderAuthor() {
    const {
      message,
      settings: { default_locale: locale },
      encryptionStatus,
      isLocked,
    } = this.props;

    const isDecrypted =
      encryptionStatus && encryptionStatus.status === STATUS_DECRYPTED;
    const author = getAuthor(message);

    return (
      <TextBlock
        className={classnames('m-mail-message-details__author', {
          'm-mail-message-details__author--encrypted': isDecrypted,
        })}
      >
        {(isDecrypted || isLocked) && (
          <Fragment>
            <Icon
              type="lock"
              className="m-mail-message-details--encrypted__icon"
            />{' '}
          </Fragment>
        )}
        <Icon
          type="envelope"
          className={classnames({
            'm-mail-message-details--encrypted__icon': isDecrypted || isLocked,
          })}
        />{' '}
        <ParticipantLabel
          className="m-mail-message-details__author-name"
          participant={author}
        />{' '}
        <Moment fromNow locale={locale} titleFormat="LLLL" withTitle>
          {message.date}
        </Moment>
      </TextBlock>
    );
  }

  render() {
    const {
      message,
      onOpenTags,
      noInteractions,
      encryptionStatus,
      forwardedRef,
    } = this.props;
    const isDecrypted =
      encryptionStatus && encryptionStatus.status === STATUS_DECRYPTED;
    const pi = getAveragePIMessage({ message });
    const piType = getPiClass(pi);
    const author = getAuthor(message);
    const recipients = getRecipients(message);

    const infoPiClassName = {
      's-mail-message__info--super': piType === 'super',
      's-mail-message__info--good': piType === 'good',
      's-mail-message__info--bad': piType === 'bad',
      's-mail-message__info--ugly': piType === 'ugly',
    };

    return (
      <article
        id={`message-${message.message_id}`}
        ref={forwardedRef}
        className="s-mail-message"
      >
        <div className="s-mail-message__details m-mail-message-details">
          {this.renderAuthor()}
          <TextBlock className="m-mail-message-details__recipients">
            <Trans id="message.to" message="To:" />{' '}
            <MessageRecipients message={message} shorten />
          </TextBlock>
        </div>
        <aside className={classnames('s-mail-message__info', infoPiClassName)}>
          <MessagePi message={message} illustrate describe />
          <div className="s-mail-message__participants">
            <div className="s-mail-message__participants-from">
              <span className="direction">
                <Trans id="message.from" message="From:" />
              </span>{' '}
              <ParticipantLabel participant={author} />
            </div>
            <div className="s-mail-message__participants-to">
              <span className="direction">
                <Trans id="message.to" message="To:" />
              </span>{' '}
              {recipients.map((participant, i) => (
                <Fragment key={participant.address}>
                  {i > 0 && ', '}
                  <ParticipantLabel participant={participant} />
                </Fragment>
              ))}
            </div>
          </div>
          <TagList className="s-mail-message__tags" message={message} />
        </aside>
        <div className="s-mail-message__container">
          <h2 className="s-mail-message__subject">
            <TextBlock nowrap={false}>{message.subject}</TextBlock>
          </h2>
          {this.renderBody()}
          <div className="m-message__attachments">
            {
              // Attachments' not decrypted
              isDecrypted && (
                <Callout
                  color="info"
                  className="s-mail-message__encrypted-attachments-info"
                >
                  <Trans id="message.attachment-encryption-not-available">
                    Attachments decryption will be available in a futur version,
                    please be patient.
                  </Trans>
                </Callout>
              )
            }
            <MessageAttachments message={message} />
          </div>
        </div>
        {!noInteractions && (
          <footer className="s-mail-message__actions">
            <Button
              className="m-message-action-container__action"
              onClick={this.handleReply}
              icon="reply"
              responsive="icon-only"
            >
              <Trans id="message-list.message.action.reply" message="Reply" />
            </Button>
            <Button
              onClick={onOpenTags}
              className="m-message-actions-container__action"
              icon="tags"
              responsive="icon-only"
            >
              <Trans id="message-list.message.action.tags" message="Tags" />
            </Button>
            <Confirm
              onConfirm={this.handleMessageDelete}
              title={
                <Trans
                  id="message-list.message.confirm-delete.title"
                  message="Delete a message"
                />
              }
              content={
                <Trans id="message-list.message.confirm-delete.content">
                  The deletion is permanent, are you sure you want to delete
                  this message ?
                </Trans>
              }
              render={(confirm) => (
                <Button
                  className="m-message-action-container__action"
                  onClick={confirm}
                  icon="trash"
                  responsive="icon-only"
                >
                  <Trans
                    id="message-list.message.action.delete"
                    message="Delete"
                  />
                </Button>
              )}
            />
            <Button
              className="m-message-action-container__action"
              onClick={this.handleToggleMarkAsRead}
              responsive="icon-only"
              icon={message.is_unread ? 'envelope-open' : 'envelope'}
            >
              {message.is_unread ? (
                <Trans
                  id="message-list.message.action.mark_as_read"
                  message="Mark as read"
                />
              ) : (
                <Trans
                  id="message-list.message.action.mark_as_unread"
                  message="Mark as unread"
                />
              )}
            </Button>
          </footer>
        )}
      </article>
    );
  }
}

export default MailMessage;
