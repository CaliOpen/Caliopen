import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import Moment from 'react-moment';
import MessageDate from '../../components/MessageDate';
import { Badge, Icon, Link, Checkbox } from '../../components';
import ParticipantsIconLetter from '../../components/ParticipantsIconLetter';
import getClient from '../../services/api-client';
import StickyNavBar from '../../layouts/Page/components/Navigation/components/StickyNavBar';
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

  buildParticipantsLabels = ({ participants }) =>
    participants.map(participant => participant.label);

  selectDiscussionLastAuthor = ({ participants }) => participants.find(participant => participant.type === 'From');

  renderMessageSubject = (discussion) => {
    const { last_message_subject: lastMessageSubject } = discussion;

    if (lastMessageSubject) {
      return <strong>{lastMessageSubject}</strong>;
    }

    return null;
  }

  renderTags = ({ tags }) => (
    tags && (
      <ul className="s-message-item__tags">
        {tags.map(tag => (
          <li key={tag.name} className="s-message-item__tag"><Badge>{tag.name}</Badge></li>
        ))}
      </ul>
    )
  );

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
            const labels = this.buildParticipantsLabels(discussion);

            return (
              <li
                id={`discussion-${discussionId}`}
                key={discussionId}
                data-nb-messages={total}
                data-date={date}
                className={`folded-discussion${unreadCount ? ' unread' : ''}`}
              >
                <ParticipantsIconLetter labels={labels} />
                <a className="participants">{participant.label}</a>
                <Link to={`/discussions/${discussionId}#${lastMessageId}`} className="excerpt">
                  {this.renderMessageSubject(discussion)}
                  {' '}
                  {excerpt}
                </Link>
                {this.renderTags(discussion)}
                <span className="message-type"><Icon type="envelope" /></span>
                <Moment element={MessageDate}>{date}</Moment>
                <div className="discussion-select">
                  <Checkbox label="" />
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
        <StickyNavBar className="action-bar" stickyClassName="sticky-action-bar">
          <header>
            <div className="select-all">
              <Checkbox label="" />
            </div>
          </header>
        </StickyNavBar>
        { this.renderDiscussions() }
      </section>);
  }
}

export default Home;
