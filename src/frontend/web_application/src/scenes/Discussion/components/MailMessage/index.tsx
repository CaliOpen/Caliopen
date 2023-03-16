import * as React from 'react';
import Moment from 'react-moment';
import { Trans } from '@lingui/react';
import classnames from 'classnames';
import Linkify from 'linkifyjs/react';
import { useDispatch } from 'react-redux';

import { useSettings } from 'src/modules/settings';
import {
  ParticipantLabel,
  deleteMessage,
  setMessageRead,
} from 'src/modules/message';
import { Button, Confirm, Icon, TextBlock, Callout } from 'src/components';
import { LockedMessage } from 'src/modules/encryption';
import { getAuthor, getRecipients } from 'src/services/message';
import { getAveragePIMessage, getPiClass } from 'src/modules/pi/services/pi';
import { STATUS_DECRYPTED } from 'src/store/modules/encryption';
import MessageAttachments from '../MessageAttachments';
import MessageRecipients from '../MessageRecipients';
import MessagePi from '../MessagePi';
import TagList from '../TagList';

import './style.scss';
import './mail-message-details.scss';
import { ConcreteMessageProps } from '../../types';

export default function MailMessage({
  message,
  onOpenTags,
  noInteractions,
  encryptionStatus,
  forwardedRef,
  onDeleteMessageSuccess,
  onReply,
  isLocked,
}: ConcreteMessageProps) {
  const dispatch = useDispatch();
  const { default_locale: locale } = useSettings();
  const handleMessageDelete = async () => {
    await dispatch(deleteMessage({ message }));
    onDeleteMessageSuccess();
  };

  const handleToggleMarkAsRead = () => {
    if (message.is_unread) {
      dispatch(setMessageRead({ message, isRead: true }));
    } else {
      dispatch(setMessageRead({ message, isRead: false }));
    }
  };

  const handleReply = () => {
    onReply();
  };

  const renderBody = () => {
    if (isLocked) {
      return <LockedMessage encryptionStatus={encryptionStatus} />;
    }

    const content = encryptionStatus.decryptedMessage || message.body;

    if (!message.body_is_plain && content) {
      return (
        <TextBlock
          nowrap={false}
          className="s-mail-message__content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    return (
      <TextBlock nowrap={false}>
        <Linkify tagName="pre" className="s-mail-message__content">
          {content}
        </Linkify>
      </TextBlock>
    );
  };

  const isDecrypted =
    encryptionStatus && encryptionStatus.status === STATUS_DECRYPTED;
  const author = getAuthor(message);
  const pi = getAveragePIMessage({ message });
  const piType = getPiClass(pi);
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
        <TextBlock
          className={classnames('m-mail-message-details__author', {
            'm-mail-message-details__author--encrypted': isDecrypted,
          })}
        >
          {(isDecrypted || isLocked) && (
            <>
              <Icon
                type="lock"
                className="m-mail-message-details--encrypted__icon"
              />{' '}
            </>
          )}
          <Icon
            type="envelope"
            className={classnames({
              'm-mail-message-details--encrypted__icon':
                isDecrypted || isLocked,
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
              <React.Fragment key={participant.address}>
                {i > 0 && ', '}
                <ParticipantLabel participant={participant} />
              </React.Fragment>
            ))}
          </div>
        </div>
        <TagList className="s-mail-message__tags" message={message} />
      </aside>
      <div className="s-mail-message__container">
        <h2 className="s-mail-message__subject">
          <TextBlock nowrap={false}>{message.subject}</TextBlock>
        </h2>
        {renderBody()}
        <div className="m-message__attachments">
          {
            // Attachments' not decrypted
            isDecrypted && (
              <Callout
                color="info"
                className="s-mail-message__encrypted-attachments-info"
              >
                <Trans
                  id="message.attachment-encryption-not-available"
                  message="Attachments decryption will be available in a futur version, please be patient."
                />
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
            onClick={handleReply}
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
            onConfirm={handleMessageDelete}
            title={
              <Trans
                id="message-list.message.confirm-delete.title"
                message="Delete a message"
              />
            }
            content={
              <Trans
                id="message-list.message.confirm-delete.content"
                message="The deletion is permanent, are you sure you want to delete this message ?"
              />
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
            onClick={handleToggleMarkAsRead}
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
