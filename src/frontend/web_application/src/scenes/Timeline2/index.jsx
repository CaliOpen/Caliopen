import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import Moment from 'react-moment';
import MessageDate from '../../components/MessageDate';
import { Icon, Link, Checkbox } from '../../components';
import getClient from '../../services/api-client';
import { renderParticipant } from '../../services/message';
import AvatarLetter from '../../modules/avatar/components/AvatarLetter';
import AvatarLetterWrapper from '../../modules/avatar/components/AvatarLetterWrapper';
import withScrollManager from '../../modules/scroll/hoc/scrollManager';

import './style.scss';

@withScrollManager()
class Home extends Component {
  constructor(props) {
    super(props);
    this.client = getClient();
    this.state = {};

    this.client.get('/api/v1/discussions')
      .then((response) => { this.setState({ discussions: response.data.discussions }); });
  }

  selectDiscussionLastAuthor = discussion => discussion.participants.find(participant => participant.type === 'From');

  renderMessageSubject = (discussion) => {
    const { last_message_subject: lastMessageSubject } = discussion;

    if (lastMessageSubject) {
      return <strong>{lastMessageSubject}</strong>;
    }

    return null;
  }

  renderDiscussions() {
    const { discussions } = this.state;

    if (discussions) {
      return (
        <ul id="discussion-list">
          { discussions.map((discussion) => {
            const {
              excerpt, discussion_id: discussionId, total, date_insert: date,
              last_message_id: lastMessageId, unread_count: unreadCount,
            } = discussion;

            const participant = this.selectDiscussionLastAuthor(discussion);

            return (
              <li
                id={`discussion-${discussionId}`}
                key={discussionId}
                data-nb-messages={total}
                data-date={date}
                className={`folded-discussion${unreadCount ? ' unread' : ''}`}
              >
                <AvatarLetterWrapper>
                  <AvatarLetter word={renderParticipant(participant)} />
                </AvatarLetterWrapper>
                <a className="participants">{participant.label}</a>
                <Link to={`/discussions/${discussionId}#${lastMessageId}`} className="excerpt">
                  {this.renderMessageSubject(discussion)}
                  {' '}
                  {excerpt}
                </Link>
                <span className="message-type"><Icon type="envelope" /></span>
                <Moment element={MessageDate}>{date}</Moment>
                <div className="discussion-select">
                  <Checkbox />
                </div>
              </li>
            );
          })}
        </ul>);
    }

    return (<p>Nobody talked</p>);
  }

  render() {
    return (
      <section id="discussions" className="s-timeline">
        <header>
          <div className="select-all">
            <Checkbox />
          </div>
        </header>
        { this.renderDiscussions() }
      </section>);
  }
}

export default Home;
