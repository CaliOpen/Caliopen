import React, { PropTypes } from 'react';
import { withTranslator } from '@gandi/react-translate';
import classnames from 'classnames';
import ContactsIcon from '../ContactsIcon';
import Link from '../../../../components/Link';
import DiscussionItemActionsContainer from '../DiscussionItemActionsContainer';
import Icon from '../../../../components/Icon';
import TextBlock from '../../../../components/TextBlock';
import Badge from '../../../../components/Badge';
import recipients from '../../services/recipients';

// XXX: load data from store

// import { createSelector } from 'reselect';
//
// const userSelector = createSelector(
//   state => state.userReducer.user,
//   user => ({ user })
// );

const renderTags = discussion => discussion.tags.map((tag, key) => (
  <span key={key}>
    {' '}
    <Badge>{tag.name}</Badge>
  </span>
));

const DiscussionItem = ({ discussion, formatDate, __ }) => {
  const hasUnread = !!discussion.unread_count && discussion.unread_count > 0;
  const fakeDate = new Date();
  const user = { contact_id: 'foobar' };

  return (
    <DiscussionItemActionsContainer discussion={discussion} __={__}>
      <Link
        to={`/discussions/${discussion.thread_id}`}
        className={classnames('s-discussion-list__thread', { 's-thread-list__thread--unread': hasUnread })}
        noDecoration
      >
        <div className="s-discussion-list__col-avatars">
          <ContactsIcon discussion={discussion} />
        </div>
        <div className="s-discussion-list__col-title">
          <TextBlock>
            {recipients({ discussion, user })}
            {renderTags(discussion)}
          </TextBlock>
          <TextBlock>{discussion.text}</TextBlock>
        </div>
        <div className="s-discussion-list__col-file">
          { discussion.file_attached && <Icon type="paperclip" /> }
        </div>
        <div className="s-discussion-list__col-dates">
          <time title={formatDate(fakeDate, 'LLL')} dateTime={formatDate(fakeDate, '')}>
            <TextBlock inline>
              {formatDate(fakeDate, 'll')}
            </TextBlock> <TextBlock inline>{formatDate(fakeDate, 'LT')}</TextBlock>
          </time>
        </div>
        <div className="s-discussion-list__col-count">
          {
            discussion.unread_count && (
              <Badge low radiusType="rounded">{discussion.unread_count}</Badge>
            )
          }
        </div>
      </Link>
    </DiscussionItemActionsContainer>
  );
};

DiscussionItem.propTypes = {
  discussion: PropTypes.shape({}).isRequired,
  formatDate: PropTypes.func.isRequired,
  __: PropTypes.func.isRequired,
};

export default withTranslator()(DiscussionItem);
