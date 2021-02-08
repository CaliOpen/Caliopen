import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import classnames from 'classnames';
// import { withI18n } from '@lingui/react';
import { Icon, Link, TextBlock } from '../../../../components';
import ParticipantsIconLetter from '../../../../components/ParticipantsIconLetter';
import { getAveragePI, getPiClass } from '../../../../modules/pi';
import { ParticipantLabel } from '../../../../modules/message';
import './style.scss';
import './discussion-item-content.scss';

// @withI18n()
class DiscussionItem extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    discussion: PropTypes.shape({
      excerpt: PropTypes.string.isRequired,
      discussion_id: PropTypes.string.isRequired,
      total_count: PropTypes.number.isRequired,
      date_update: PropTypes.string.isRequired,
      last_message_id: PropTypes.string.isRequired,
      unread_count: PropTypes.number.isRequired,
      pi: PropTypes.shape({}),
      participants: PropTypes.arrayOf(
        PropTypes.shape({ protocol: PropTypes.string })
      ),
    }).isRequired,
    // i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    onSelectDiscussion: PropTypes.func.isRequired,
    isDiscussionSelected: PropTypes.bool.isRequired,
    // isDeleting: PropTypes.bool.isRequired,
    user: PropTypes.shape({
      contact: PropTypes.shape({ contact_id: PropTypes.string.isRequired })
        .isRequired,
    }).isRequired,
    settings: PropTypes.shape({ default_locale: PropTypes.string.isRequired })
      .isRequired,
  };

  static defaultProps = {
    className: undefined,
  };

  onCheckboxChange = (ev) => {
    const { discussion, onSelectDiscussion } = this.props;
    const { checked } = ev.target;

    onSelectDiscussion(checked ? 'add' : 'remove', discussion.discussion_id);
  };

  getParticipantsExceptUser = () => {
    const { discussion } = this.props;

    const participants = discussion.participants.filter(
      (participant) =>
        !(
          participant.contact_ids &&
          participant.contact_ids.some(
            (contactId) => contactId === this.props.user.contact.contact_id
          )
        )
    );

    return participants.length > 0
      ? participants
      : [discussion.participants[0]];
  };

  renderMessageSubject = (discussion) => {
    const {
      last_message_subject: lastMessageSubject,
      unread_count: unreadCount,
    } = discussion;

    if (lastMessageSubject) {
      return (
        <TextBlock
          className={classnames('s-discussion-item-content__subject', {
            's-discussion-item-content__subject--unread': unreadCount > 0,
          })}
        >
          {lastMessageSubject}
        </TextBlock>
      );
    }

    return null;
  };

  renderParticipants() {
    const {
      discussion: { discussion_id: discussionId },
    } = this.props;
    const participants = this.getParticipantsExceptUser();

    return participants.map((participant, i) => (
      <Fragment
        key={`${participant.address}-${participant.type}-${participant.protocol}-${discussionId}`}
      >
        {i > 0 && ', '}
        <ParticipantLabel participant={participant} />
      </Fragment>
    ));
  }

  render() {
    const { settings, className } = this.props;
    const {
      excerpt,
      discussion_id: discussionId,
      total_count: total,
      date_update: date,
      last_message_id: lastMessageId,
      unread_count: unreadCount,
      pi,
    } = this.props.discussion;

    // XXX: discussion does not support pi_message yet
    const piAggregate = getAveragePI(pi);

    // const { isDeleting, isDiscussionSelected, i18n } = this.props;

    const participants = this.getParticipantsExceptUser();
    const iconProtocol = this.props.discussion.participants[0].protocol;

    return (
      <li
        id={`discussion-${discussionId}`}
        data-nb-messages={total}
        data-date={date}
        className={classnames(
          className,
          's-discussion-item',
          { 's-discussion-item--is-unread': unreadCount > 0 },
          `s-discussion-item--${getPiClass(piAggregate)}`
        )}
      >
        <div className="s-discussion-item__col-avatar">
          <ParticipantsIconLetter
            labels={participants.map((participant) => participant.label)}
          />
        </div>
        <div className="s-discussion-item__col-content">
          <Link
            to={`/discussions/${discussionId}#${lastMessageId}`}
            noDecoration
            className="s-discussion-item-content"
          >
            <TextBlock className="s-discussion-item-content__participants">
              {this.renderParticipants()}
            </TextBlock>
            {this.renderMessageSubject(this.props.discussion)}
            <TextBlock className="s-discussion-item-content__excerpt">
              {excerpt}
            </TextBlock>
            <span className="s-discussion-item-content__protocol">
              <Icon type={iconProtocol} />
            </span>
            <TextBlock className="s-discussion-item-content__date">
              <Moment
                fromNow
                locale={settings.default_locale}
                titleFormat="LLLL"
                withTitle
              >
                {date}
              </Moment>
            </TextBlock>
          </Link>
        </div>
        {/*
        <div className="s-discussion-item__select">
          <Checkbox
            label={i18n._('message-list.action.select_single_discussion', null,
              { defaults: 'Select/deselect this discussion' })}
            onChange={this.onCheckboxChange}
            id={discussionId}
            checked={isDiscussionSelected}
            disabled={isDeleting}
            showLabelforSr
          />
        </div>
        */}
      </li>
    );
  }
}

export default DiscussionItem;
