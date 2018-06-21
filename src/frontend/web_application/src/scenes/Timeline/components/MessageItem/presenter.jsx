import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Moment from 'react-moment';
import { Trans } from 'lingui-react';
import MessageDate from '../../../../components/MessageDate';
import { AuthorAvatarLetter, SIZE_SMALL } from '../../../../modules/avatar';
// import MessageItemContainer from '../MessageItemContainer';
import { Badge, Link, Checkbox, Icon, TextBlock } from '../../../../components/';
import { getTagLabel, getCleanedTagCollection } from '../../../../modules/tags';
import { renderParticipant, getAuthor } from '../../../../services/message';

import './style.scss';

class MessageItem extends Component {
  static propTypes = {
    i18n: PropTypes.shape({}).isRequired,
    message: PropTypes.shape({}).isRequired,
    settings: PropTypes.shape({}).isRequired,
    isMessageFromUser: PropTypes.bool.isRequired,
    userTags: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    onSelectMessage: PropTypes.func,
    isMessageSelected: PropTypes.bool.isRequired,
    isDeleting: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    onSelectMessage: str => str,
  };

  onCheckboxChange = (ev) => {
    const { message, onSelectMessage } = this.props;
    const { checked } = ev.target;

    onSelectMessage(checked ? 'add' : 'remove', message.message_id);
  }

  renderAuthor = () => {
    const author = getAuthor(this.props.message);

    return (
      <TextBlock className="s-message-item__author" title={renderParticipant(author)}>
        {renderParticipant(author)}
      </TextBlock>
    );
  }

  renderDate = () => {
    const { message, settings: { default_locale: locale }, isMessageFromUser } = this.props;
    const hasDate = (isMessageFromUser && message.date)
      || (!isMessageFromUser && message.date_insert);
    const msgDate = isMessageFromUser && !message.is_draft ? message.date : message.date_insert;


    return hasDate && (
      <TextBlock>
        {this.renderType()}
        {' '}
        <Moment locale={locale} element={MessageDate}>
          {msgDate}
        </Moment>
      </TextBlock>
    );
  }

  renderTags() {
    const { userTags, message, i18n } = this.props;

    return message.tags && (
      <ul className="s-message-item__tags">
        {getCleanedTagCollection(userTags, message.tags).map(tag => (
          <li key={tag.name} className="s-message-item__tag"><Badge>{getTagLabel(i18n, tag)}</Badge></li>
        ))}
      </ul>
    );
  }


  renderContent = () => {
    const { message } = this.props;
    const { attachments } = message;
    const hash = message.is_draft ? 'reply' : message.message_id;

    return (
      <Link
        className={classnames(
          's-message-item__content',
          {
            's-message-item__content--draft': message.is_draft,
          }
        )}
        to={`/discussions/${message.discussion_id}#${hash}`}
        noDecoration
      >

        {this.renderAuthor()}

        <TextBlock className="s-message-item__title">
          {message.is_draft && (<span className="s-message-item__draft-prefix"><Trans id="timeline.draft-prefix">Draft in progress:</Trans>{' '}</span>)}
          {message.subject && (<span className="s-message-item__subject">{message.subject}{' '}</span>)}
          <span className="s-message-item__excerpt">{message.excerpt}</span>
        </TextBlock>

        {attachments && attachments.length !== 0 && (
          <span className="s-message-item__file">
            <Icon type="paperclip" />
          </span>
        )}

        {this.renderTags()}
      </Link>
    );
  }

  renderType = () => {
    const { i18n, message } = this.props;
    const typeTranslations = {
      email: i18n._('message-list.message.protocol.email', { defaults: 'email' }),
    };

    const messageType = message.type && typeTranslations[message.type];

    return message.type && (
      <span className="s-message-item__type">
        <Icon type={message.type} spaced className="s-message-item__type-icon" />
        <span className="s-message-item__type-label sr-only">
          {messageType}
          {' '}
          <Trans id="message-list.message.received-on">received on</Trans>
        </span>
      </span>
    );
  }

  render() {
    const {
      i18n, message, isMessageSelected, isDeleting,
    } = this.props;

    return (
      <div
        className={classnames(
          's-message-item',
          {
            's-message-item--unread': message.is_unread,
            's-message-item--draft': message.is_draft,
            's-message-item--is-selected': isMessageSelected,
            // TODO: define how to compute PIs for rendering
            // 's-message-item--pi-super': pi.context >= 90,
            // 's-message-item--pi-good': pi.context >= 50 && pi.context < 90,
            // 's-message-item--pi-bad': pi.context >= 25 && pi.context < 50,
            // 's-message-item--pi-ugly': pi.context >= 0 && pi.context < 25,
          }
        )}
      >
        <div className="s-message-item__col-avatar">
          <label htmlFor={message.message_id}>
            <AuthorAvatarLetter
              size={SIZE_SMALL}
              message={message}
              isSelected={isMessageSelected}
            />
          </label>
        </div>
        <div className="s-message-item__col-content">
          {this.renderContent()}
        </div>
        <div className="s-message-item__col-date">
          {this.renderDate()}
        </div>
        <div className="s-message-item__col-select">
          <Checkbox
            label={i18n._('message-list.action.select_single_message', { defaults: 'Select/deselect this message' })}
            onChange={this.onCheckboxChange}
            id={message.message_id}
            checked={isMessageSelected}
            disabled={isDeleting}
            showLabelforSr
          />
        </div>
      </div>
    );
  }
}

export default MessageItem;
