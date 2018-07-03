import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import Link from '../components/Link';
import getClient from '../services/api-client';
import { renderParticipant } from '../services/message';
import AvatarLetter from '../modules/avatar/components/AvatarLetter';
import AvatarLetterWrapper from '../modules/avatar/components/AvatarLetterWrapper';
import './home.scss';

class Home extends Component {
  constructor(props) {
    super(props);
    this.client = getClient();
    this.state = {};

    this.client.get('/api/v1/discussions')
      .then((response) => { this.setState({ discussions: response.data.discussions }); });
  }

  selectDiscussionAuthor = discussion => discussion.participants.find(participant => participant.type === 'From');

  renderDiscussions() {
    const { discussions } = this.state;

    if (discussions) {
      return (
        <ul>
          { discussions.map((discussion) => {
            const {
              excerpt, discussion_id: discussionId, total, date_insert: date,
              last_message_id: lastMessageId,
            } = discussion;

            const participant = this.selectDiscussionAuthor(discussion);

            return (
              <li id={`discussion-${discussionId}`} key={discussionId} data-nb-messages={total} data-date={date} className="folded-discussion">
                <AvatarLetterWrapper>
                  <AvatarLetter word={renderParticipant(participant)} />
                </AvatarLetterWrapper>
                <Link to={`/discussions/${discussionId}#${lastMessageId}`}>
                  {excerpt}
                </Link>
              </li>
            );
          })}
        </ul>);
    }

    return (<p>Nobody talked</p>);
  }

  render() {
    return (
      <section id="discussion-list" className="s-timeline">
        { this.renderDiscussions() }
      </section>);
  }
}

export default Home;
