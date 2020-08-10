import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import classNames from 'classnames';
import Linkify from 'linkifyjs/react';
import { withI18n, Trans } from '@lingui/react';
import { withScrollTarget } from '../../../../modules/scroll';
import { withPush } from '../../../../modules/routing';
import { getAveragePIMessage, getPiClass } from '../../../../modules/pi';
import { AuthorAvatarLetter } from '../../../../modules/avatar';
import { LockedMessage } from '../../../../modules/encryption';
import { ParticipantLabel } from '../../../../modules/message';
import { Button, Confirm, Icon, TextBlock } from '../../../../components';
import {
  isMessageFromUser,
  getAuthor,
  isUserRecipient,
  getRecipientsExceptUser,
  getRecipients,
} from '../../../../services/message';
import MessagePi from '../MessagePi';
import TagList from '../TagList';
import { replyHandler } from '../../services/replyHandler';
import { messageDeleteHandler } from '../../services/messageDeleteHandler';
import { toggleMarkAsReadHandler } from '../../services/toggleMarkAsReadHandler';

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

@withI18n()
@withScrollTarget()
@withPush()
class InstantMessage extends PureComponent {
  static propTypes = {
    message: PropTypes.shape({}).isRequired,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    // XXX: No UI for that
    noInteractions: PropTypes.bool,
    onMessageRead: PropTypes.func,
    onMessageUnread: PropTypes.func,
    onMessageDelete: PropTypes.func,
    onOpenTags: PropTypes.func.isRequired,
    onReply: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
    user: PropTypes.shape({}).isRequired,
    scrollTarget: PropTypes.shape({ forwardRef: PropTypes.func }).isRequired,
    isLocked: PropTypes.bool.isRequired,
    encryptionStatus: PropTypes.shape({}),
  };

  static defaultProps = {
    encryptionStatus: undefined,
    onMessageRead: () => {
      // noop
    },
    onMessageUnread: () => {
      // noop
    },
    onMessageDelete: () => {
      // noop
    },
    noInteractions: false,
  };

  handleMessageDelete = messageDeleteHandler(this);

  handleToggleMarkAsRead = toggleMarkAsReadHandler(this);

  handleReply = replyHandler(this);

  getProtocolIconType = ({ protocol }) => PROTOCOL_ICONS[protocol] || 'comment';

  getRecipientsString = (shorten) => {
    const { i18n } = this.props;
    const recipients = this.getRecipientsArray();
    const numberRecipients = recipients.length;

    if (numberRecipients === 0) {
      return i18n._('message.participants.me', null, { defaults: 'Me' });
    }
    if (!shorten || numberRecipients === 1) {
      return recipients.join(', ');
    }

    return i18n._(
      'messages.participants.and_x_others',
      { first: recipients[0], number: numberRecipients - 1 },
      {
        defaults:
          '{first} and {number, plural, one {# other} other {# others}}',
      }
    );
  };

  getRecipientsLabels = (recipients) => {
    if (!recipients) return [];

    return recipients.map((recipient) =>
      recipient.label ? recipient.label : recipient.address
    );
  };

  getRecipientsArray = () => {
    const { message, user, i18n } = this.props;

    return isUserRecipient(message, user)
      ? [
          i18n._('message.participants.me', null, { defaults: 'Me' }),
          ...this.getRecipientsLabels(getRecipientsExceptUser(message, user)),
        ]
      : this.getRecipientsLabels(getRecipients(message));
  };

  renderBody() {
    const { message } = this.props;

    return message.body_is_plain ? (
      <TextBlock className="m-instant-message__content" nowrap={false}>
        <Linkify>{message.body}</Linkify>
      </TextBlock>
    ) : (
      <TextBlock
        nowrap={false}
        className="m-instant-message__content"
        dangerouslySetInnerHTML={{ __html: message.body }}
      />
    );
  }

  renderActions() {
    const { i18n, message, noInteractions, onOpenTags } = this.props;

    if (noInteractions) {
      return null;
    }

    return (
      <div className="m-instant-message-aside__actions">
        <Button
          onClick={this.handleReply}
          icon="reply"
          title={i18n._('message-list.message.action.reply', null, {
            defaults: 'Reply',
          })}
        />
        <Button
          onClick={onOpenTags}
          icon="tags"
          title={i18n._('message-list.message.action.tags', null, {
            defaults: 'Tags',
          })}
        />
        <Confirm
          onConfirm={this.handleMessageDelete}
          title={
            <Trans id="message-list.message.confirm-delete.title">
              Delete a message
            </Trans>
          }
          content={
            <Trans id="message-list.message.confirm-delete.content">
              The deletion is permanent, are you sure you want to delete this
              message ?
            </Trans>
          }
          render={(confirm) => (
            <Button
              onClick={confirm}
              icon="trash"
              title={i18n._('message-list.message.action.delete', null, {
                defaults: 'Delete',
              })}
            />
          )}
        />
        <Button
          onClick={this.handleToggleMarkAsRead}
          icon={message.is_unread ? 'envelope-open' : 'envelope'}
          title={
            message.is_unread
              ? i18n._('message-list.message.action.mark_as_read', null, {
                  defaults: 'Mark as read',
                })
              : i18n._('message-list.message.action.mark_as_unread', null, {
                  defaults: 'Mark as unread',
                })
          }
        />
      </div>
    );
  }

  render() {
    const {
      isLocked,
      encryptionStatus,
      message,
      scrollTarget: { forwardRef },
    } = this.props;
    const author = getAuthor(message);
    const pi = getAveragePIMessage({ message });

    const articleClassNames = classNames(
      'm-instant-message',
      `${getPiClass(pi)}`,
      {
        'm-instant-message--from-user': isMessageFromUser(
          message,
          this.props.user
        ),
      }
    );

    return (
      <article className={articleClassNames} ref={forwardRef}>
        <header className="m-instant-message__author m-instant-message-author">
          <AuthorAvatarLetter
            message={message}
            className="m-instant-message-author__avatar"
          />
          <Icon type={this.getProtocolIconType(message)} />
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
                {this.getRecipientsString(true)}
                <Icon
                  type="caret-down"
                  title={this.getRecipientsString(false)}
                />
              </TextBlock>
            </div>
            <MessagePi illustrate={false} describe={false} message={message} />
          </div>
          {this.renderActions()}
          <TagList
            className="m-instant-message-aside__tags"
            message={message}
          />
        </aside>
        {isLocked ? (
          <LockedMessage encryptionStatus={encryptionStatus} />
        ) : (
          this.renderBody()
        )}
      </article>
    );
  }
}

export default InstantMessage;
