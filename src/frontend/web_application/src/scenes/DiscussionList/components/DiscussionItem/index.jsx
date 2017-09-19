import React from 'react';
import PropTypes from 'prop-types';
import { withTranslator } from '@gandi/react-translate';
import classnames from 'classnames';
import ParticipantsIcon from '../ParticipantsIcon';
import Link from '../../../../components/Link';
import Icon from '../../../../components/Icon';
import TextBlock from '../../../../components/TextBlock';
import Badge from '../../../../components/Badge';
import recipients from '../../services/recipients';
import DiscussionItemContainer from '../DiscussionItemContainer';

const renderTags = discussion => discussion.tags && discussion.tags.map((tag, key) => (
  <span key={key}>
    {' '}
    <Badge className="s-discussion-list__tag">{tag.name}</Badge>
  </span>
));

const DiscussionItem = ({ user, discussion, formatDate }) => {
  const hasUnread = !!discussion.unread_count && discussion.unread_count > 0;
  const discussionDate = discussion.date_update || discussion.date_insert;

  return (
    <DiscussionItemContainer discussion={discussion}>
      <Link
        to={`/discussions/${discussion.discussion_id}`}
        className={classnames('s-discussion-list__thread', { 's-thread-list__thread--unread': hasUnread })}
        noDecoration
      >
        <div className="s-discussion-list__col-avatars">
          <ParticipantsIcon discussion={discussion} />
        </div>
        <div className="s-discussion-list__col-title">
          <TextBlock>
            {recipients({ discussion, user })}
            {renderTags(discussion)}
          </TextBlock>
          <TextBlock>{discussion.excerpt}</TextBlock>
        </div>
        <div className="s-discussion-list__col-file">
          { discussion.attachment_count > 0 && <Icon type="paperclip" /> }
        </div>
        <div className="s-discussion-list__col-dates">
          <time
            title={formatDate(discussionDate, 'LLL')}
            dateTime={formatDate(discussionDate, '')}
          >
            <TextBlock inline>
              {formatDate(discussionDate, 'll')}
            </TextBlock> <TextBlock inline>{formatDate(discussionDate, 'LT')}</TextBlock>
          </time>
        </div>
        <div className="s-discussion-list__col-count">
          {
            discussion.unread_count !== 0 && (
              <Badge low radiusType="rounded">{discussion.unread_count}</Badge>
            )
          }
        </div>
      </Link>
    </DiscussionItemContainer>
  );
};

DiscussionItem.propTypes = {
  user: PropTypes.shape({}).isRequired,
  discussion: PropTypes.shape({}).isRequired,
  formatDate: PropTypes.func.isRequired,
};

export default withTranslator()(DiscussionItem);
