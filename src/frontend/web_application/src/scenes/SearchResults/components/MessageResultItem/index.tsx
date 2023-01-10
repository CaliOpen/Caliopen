import * as React from 'react';
import classnames from 'classnames';
import Moment from 'react-moment';
import { Trans, useLingui } from '@lingui/react';
import { Message } from 'src/modules/message';
import { useSettings } from 'src/modules/settings';
import {
  getTagLabel,
  getCleanedTagCollection,
  useTags,
} from '../../../../modules/tags';
import MessageDate from '../../../../components/MessageDate';
import { AuthorAvatarLetter, SIZE_SMALL } from '../../../../modules/avatar';
import { Badge, Link, Icon, TextBlock } from '../../../../components';
import { renderParticipant } from '../../../../services/message';
import Highlights from '../Highlights';

import './style.scss';

const EMPTY_ARRAY = [];
interface Props {
  message: Message;
  term: string;
}

function MessageResultItem({ message, term }: Props) {
  const { i18n } = useLingui();
  const { default_locale: locale } = useSettings();
  const { participants } = message;

  const author = participants.find(
    (participant) => participant.type === 'From'
  );

  const { tags } = useTags();
  const messageTags = message.tags
    ? getCleanedTagCollection(tags, message.tags)
    : EMPTY_ARRAY;

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
          <Highlights term={term} highlights={renderParticipant(author)} />
        </span>
        <span className={topicClassNames}>
          {message.attachments && message.attachments.length > 0 && (
            <Icon type="paperclip" spaced />
          )}
          {message.is_draft && (
            <span className="s-message-result-item__draft-prefix">
              <Trans id="timeline.draft-prefix" message="Draft in progress:" />{' '}
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
          {messageTags.map((tag) => (
            <span key={tag.name}>
              {' '}
              <Badge className="s-message-result-item__tag">
                {getTagLabel(i18n, tag)}
              </Badge>
            </span>
          ))}
        </span>
      </TextBlock>

      <div className="s-message-result-item__col-date">
        <Moment locale={locale} element={MessageDate}>
          {message.date_insert}
        </Moment>
      </div>

      <TextBlock className="s-message-result-item__highlights">
        <span title={message.excerpt}>
          <Highlights term={term} highlights={message.excerpt} />
        </span>
      </TextBlock>
    </Link>
  );
}

export default MessageResultItem;
