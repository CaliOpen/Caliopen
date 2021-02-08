import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Moment from 'react-moment';
import { Trans } from '@lingui/react';
import {
  WithTags,
  getTagLabel,
  getCleanedTagCollection,
} from '../../../../modules/tags';
import MessageDate from '../../../../components/MessageDate';
import { AuthorAvatarLetter, SIZE_SMALL } from '../../../../modules/avatar';
import { Badge, Link, Icon, TextBlock } from '../../../../components';
import { renderParticipant } from '../../../../services/message';
import Highlights from '../Highlights';

import './style.scss';

class MessageResultItem extends PureComponent {
  static propTypes = {
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    message: PropTypes.shape({}).isRequired,
    term: PropTypes.string.isRequired,
    highlights: PropTypes.shape({}),
    locale: PropTypes.string.isRequired,
  };

  static defaultProps = {
    highlights: null,
  };

  renderAuthor() {
    const {
      message: { participants },
      term,
    } = this.props;
    const author = participants.find(
      (participant) => participant.type === 'From'
    );

    return <Highlights term={term} highlights={renderParticipant(author)} />;
  }

  renderTags() {
    const { i18n, message } = this.props;

    if (!message.tags) {
      return null;
    }

    return (
      <WithTags
        render={(userTags) =>
          getCleanedTagCollection(userTags, message.tags).map((tag) => (
            <span key={tag.name}>
              {' '}
              <Badge className="s-message-result-item__tag">
                {getTagLabel(i18n, tag)}
              </Badge>
            </span>
          ))
        }
      />
    );
  }

  renderHighlights() {
    const { term, message } = this.props;

    return (
      <span title={message.excerpt}>
        <Highlights term={term} highlights={message.excerpt} />
      </span>
    );
  }

  render() {
    const { message, locale, term } = this.props;
    const resultItemClassNames = classnames('s-message-result-item', {
      's-message-result-item--unread': message.is_unread,
      's-message-result-item--draft': message.is_draft,
    });

    const topicClassNames = classnames('s-message-result-item__topic', {
      's-message-result-item__topic--unread': message.is_unread,
      's-message-result-item__topic--draft': message.is_draft,
    });

    return (
      <Link
        to={`/discussions/${message.discussion_id}`}
        className={resultItemClassNames}
        noDecoration
      >
        <div className="s-message-result-item__col-avatar">
          <AuthorAvatarLetter message={message} size={SIZE_SMALL} />
        </div>

        <TextBlock className="s-message-result-item__col-title">
          <span className="s-message-result-item__author">
            {this.renderAuthor()}
          </span>
          <span className={topicClassNames}>
            {message.attachments && message.attachments.length > 0 && (
              <Icon type="paperclip" spaced />
            )}
            {message.is_draft && (
              <span className="s-message-result-item__draft-prefix">
                <Trans id="timeline.draft-prefix">Draft in progress:</Trans>{' '}
              </span>
            )}
            {message.subject && (
              <span className="s-message-result-item__info-subject">
                <Highlights term={term} highlights={message.subject} />
              </span>
            )}
          </span>
          <span className="s-message-result-item__tags">
            {' '}
            {this.renderTags()}
          </span>
        </TextBlock>

        <div className="s-message-result-item__col-date">
          <Moment locale={locale} element={MessageDate}>
            {message.date_insert}
          </Moment>
        </div>

        <TextBlock className="s-message-result-item__highlights">
          {this.renderHighlights()}
        </TextBlock>
      </Link>
    );
  }
}

export default MessageResultItem;
