import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Trans } from '@lingui/react';
import { Title } from '../../../../components';
import Message from '../../../Discussion/components/Message';
import { withUser } from '../../../../modules/user';
import { withSettings } from '../../../../modules/settings';
import { withDraftDiscussion } from './withDraftDiscussion';

@withUser()
@withSettings()
@withDraftDiscussion()
class DraftDiscussion extends Component {
  static propTypes = {
    className: PropTypes.string,
    userState: PropTypes.shape({ user: PropTypes.shape({}).isRequired })
      .isRequired,
    draftDiscussion: PropTypes.shape({
      discussion: PropTypes.shape({}),
      messages: PropTypes.arrayOf(PropTypes.shape({})),
    }),
    settings: PropTypes.shape({}).isRequired,
  };

  static defaultProps = {
    className: undefined,
    draftDiscussion: {
      discussion: undefined,
      messages: [],
    },
  };

  getParticipants = () => {
    const {
      draftDiscussion: { discussion },
      userState: { user },
    } = this.props;

    if (!discussion) {
      return null;
    }

    return discussion.participants
      .filter(
        (participant) =>
          !(
            participant.contact_ids &&
            participant.contact_ids.some(
              (contactId) => contactId === user.contact.contact_id
            )
          )
      )
      .map((participant) => participant.label);
  };

  render() {
    const {
      className,
      draftDiscussion: { discussion, messages },
      userState: { user },
      settings,
    } = this.props;

    if (!discussion) {
      return null;
    }

    const participants = this.getParticipants().join(', ');

    return (
      <div className={classnames(className)}>
        <Title hr>
          <Trans
            id="discussion-draft.last-messages"
            defaults="Last messages with {participants}"
            values={{ participants }}
          />
        </Title>
        {messages.map((message) => (
          <Message
            key={message.message_id}
            message={message}
            user={user}
            settings={settings}
            noInteractions
          />
        ))}
      </div>
    );
  }
}

export default DraftDiscussion;
