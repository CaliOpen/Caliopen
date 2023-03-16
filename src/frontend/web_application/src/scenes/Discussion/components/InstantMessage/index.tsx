import * as React from 'react';
import Moment from 'react-moment';
import classNames from 'classnames';
import Linkify from 'linkifyjs/react';
import { Trans, useLingui } from '@lingui/react';
import { useDispatch } from 'react-redux';

import { getAveragePIMessage, getPiClass } from 'src/modules/pi';
import { AuthorAvatarLetter } from 'src/modules/avatar';
import { LockedMessage } from 'src/modules/encryption';
import { ParticipantLabel, setMessageRead } from 'src/modules/message';
import { deleteMessage } from 'src/store/modules/message';
import { Button, Confirm, Icon, TextBlock } from 'src/components';
import {
  isMessageFromUser,
  getAuthor,
  isUserRecipient,
  getRecipientsExceptUser,
  getRecipients,
} from 'src/services/message';
import { useUser } from 'src/modules/user';

import MessagePi from '../MessagePi';
import TagList from '../TagList';
import { ConcreteMessageProps } from '../../types';

import './style.scss';
import './instant-message-aside.scss';
import './instant-message-author.scss';
import './instant-message-participants.scss';

const PROTOCOL_ICONS = {
  facebook: 'facebook',
  twitter: 'twitter',
  mastodon: 'mastodon',
  sms: 'phone',
  email: 'envelope',
  default: 'comment',
};

export default function InstantMessage({
  message,
  onDeleteMessageSuccess,
  isLocked,
  encryptionStatus,
  forwardedRef,
  noInteractions,
  onOpenTags,
  onReply,
}: ConcreteMessageProps) {
  const dispatch = useDispatch();
  const { i18n } = useLingui();
  const { user } = useUser();

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

  const getProtocolIconType = ({ protocol }) =>
    PROTOCOL_ICONS[protocol] || 'comment';
  const getRecipientsLabels = (recipients) => {
    if (!recipients) return [];

    return recipients.map((recipient) =>
      recipient.label ? recipient.label : recipient.address
    );
  };

  const getRecipientsArray = () =>
    isUserRecipient(message, user)
      ? [
          i18n._(/* i18n */ 'message.participants.me', undefined, {
            message: 'Me',
          }),
          ...getRecipientsLabels(getRecipientsExceptUser(message, user)),
        ]
      : getRecipientsLabels(getRecipients(message));

  const getRecipientsString = (shorten) => {
    const recipients = getRecipientsArray();
    const numberRecipients = recipients.length;

    if (numberRecipients === 0) {
      return i18n._(/* i18n */ 'message.participants.me', undefined, {
        message: 'Me',
      });
    }
    if (!shorten || numberRecipients === 1) {
      return recipients.join(', ');
    }

    return i18n._(
      /* i18n */ 'messages.participants.and_x_others',
      { first: recipients[0], number: numberRecipients - 1 },
      {
        message: '{first} and {number, plural, one {# other} other {# others}}',
      }
    );
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
          className="m-instant-message__content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    return (
      <TextBlock className="m-instant-message__content" nowrap={false}>
        <Linkify>{content}</Linkify>
      </TextBlock>
    );
  };

  const author = getAuthor(message);
  const pi = getAveragePIMessage({ message });

  const articleClassNames = classNames(
    'm-instant-message',
    `${getPiClass(pi)}`,
    {
      'm-instant-message--from-user': isMessageFromUser(message, user),
    }
  );

  return (
    <article className={articleClassNames} ref={forwardedRef}>
      <header className="m-instant-message__author m-instant-message-author">
        <AuthorAvatarLetter
          message={message}
          className="m-instant-message-author__avatar"
        />
        <Icon type={getProtocolIconType(message)} />
        <Moment
          className="m-instant-message-author__time"
          format="HH:mm"
          titleFormat="LLLL"
          withTitle
        >
          {message.date}
        </Moment>
      </header>
      <aside className="m-instant-message__info m-instant-message-aside">
        <div className="m-instant-message-aside__info">
          <div className="m-instant-message__participants m-instant-message-participants">
            <TextBlock className="m-instant-message-participants__from">
              <ParticipantLabel participant={author} />
            </TextBlock>
            <TextBlock className="m-instant-message-participants__to">
              {getRecipientsString(true)}
              <Icon type="caret-down" title={getRecipientsString(false)} />
            </TextBlock>
          </div>
          <MessagePi illustrate={false} describe={false} message={message} />
        </div>
        {!noInteractions && (
          <div className="m-instant-message-aside__actions">
            <Button
              onClick={handleReply}
              icon="reply"
              title={i18n._(
                /* i18n */ 'message-list.message.action.reply',
                undefined,
                {
                  message: 'Reply',
                }
              )}
            />
            <Button
              onClick={onOpenTags}
              icon="tags"
              title={i18n._(
                /* i18n */ 'message-list.message.action.tags',
                undefined,
                {
                  message: 'Tags',
                }
              )}
            />
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
                  onClick={confirm}
                  icon="trash"
                  title={i18n._(
                    /* i18n */ 'message-list.message.action.delete',
                    undefined,
                    {
                      message: 'Delete',
                    }
                  )}
                />
              )}
            />
            <Button
              onClick={handleToggleMarkAsRead}
              icon={message.is_unread ? 'envelope-open' : 'envelope'}
              title={
                message.is_unread
                  ? i18n._(
                      /* i18n */ 'message-list.message.action.mark_as_read',
                      undefined,
                      {
                        message: 'Mark as read',
                      }
                    )
                  : i18n._(
                      /* i18n */ 'message-list.message.action.mark_as_unread',
                      undefined,
                      {
                        message: 'Mark as unread',
                      }
                    )
              }
            />
          </div>
        )}
        <TagList className="m-instant-message-aside__tags" message={message} />
      </aside>

      {renderBody()}
    </article>
  );
}
