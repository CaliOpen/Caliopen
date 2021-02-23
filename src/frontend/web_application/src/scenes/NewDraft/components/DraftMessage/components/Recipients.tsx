import * as React from 'react';
import { Trans } from '@lingui/react';
import { useDispatch } from 'react-redux';
import { editDraft } from 'src/store/modules/draft-message';
import { Icon } from '../../../../../components';
import { getIconType } from '../../../../../services/protocols-config';
import RecipientList from '../../../../../modules/draftMessage/components/RecipientList';
import { DraftMessageFormData } from '../../../../../modules/draftMessage';
import RecipientSelector from '../../../../../modules/draftMessage/components/RecipientSelector';
import Recipient from '../../../../../modules/draftMessage/components/Recipient/presenter';

interface RecipientsProps {
  draftMessage: DraftMessageFormData;
  className?: string;
  availableIdentities: any[];
}

export default function Recipients({
  draftMessage,
  className,
  availableIdentities,
}: RecipientsProps) {
  const dispatch = useDispatch();
  if (!draftMessage.parent_id) {
    const identity = availableIdentities.find(
      (ident) => ident.identity_id === draftMessage.identity_id
    );

    const handleRecipientsChange = (recipients) => dispatch(
        editDraft({
          ...draftMessage,
          recipients,
        })
      );

    return (
      <RecipientList
        className={className}
        messageId={draftMessage.message_id}
        recipients={draftMessage.recipients}
        onRecipientsChange={handleRecipientsChange}
        identity={identity}
      />
    );
  }

  // /!\ the associated contact might be deleted
  const isOne2One =
    draftMessage.recipients.length === 1 &&
    draftMessage.recipients[0].contact_ids &&
    draftMessage.recipients[0].contact_ids.length > 0;
  const [firstRecipient] = (isOne2One && draftMessage.recipients) || [];

  if (isOne2One) {
    const handleChangeOne2OneRecipient = (ev) => {
      // TODO: select the identity that match the new protocol
      const participant = ev.target.value;
      dispatch(
        editDraft({
          ...draftMessage,
          recipients: [participant],
        })
      );
    };

    return (
      <RecipientSelector
        className={className}
        contactId={(firstRecipient?.contact_ids || [])[0]}
        current={firstRecipient}
        onChange={handleChangeOne2OneRecipient}
      />
    );
  }

  return (
    <div>
      <Trans id="messages.compose.form.to.label">To</Trans>
      {draftMessage.recipients.map((recipient) => (
        <span key={`${recipient.address}_${recipient.protocol}`}>
          {/* @ts-ignore */}
          <Icon type={getIconType(recipient.protocol)} rightSpaced />
          {recipient.address}
        </span>
      ))}
    </div>
  );
}
