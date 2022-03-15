import * as React from 'react';
import classnames from 'classnames';
import { Trans } from '@lingui/react';
import { Title, TextBlock } from 'src/components';
import { useUser } from 'src/modules/user';
import { useDraftDiscussion } from './useDraftDiscussion';
import Message from '../../../Discussion/components/Message';

const EMPTY_ARRAY = [];

type Props = {
  messageId: string;
  className?: string;
};
function DraftDiscussion({ messageId, className }: Props) {
  const { discussion, messages } = useDraftDiscussion(messageId);
  const { user } = useUser();

  if (!discussion) {
    return null;
  }

  // participants except user
  const participants = discussion.participants
    .filter(
      (participant) =>
        !user ||
        !(participant.contact_ids || EMPTY_ARRAY).some(
          (contactId) => contactId === user?.contact.contact_id
        )
    )
    .map((participant) => participant.label)
    .join(', ');

  return (
    <div className={classnames(className)}>
      <Title hr>
        <TextBlock>
          <Trans
            id="discussion-draft.last-messages"
            message="Last messages with {participants}"
            values={{ participants }}
          />
        </TextBlock>
      </Title>
      {(messages || EMPTY_ARRAY).map((message) => (
        // @ts-ignore: unrecognized props
        <Message key={message.message_id} message={message} noInteractions />
      ))}
    </div>
  );
}

export default DraftDiscussion;
