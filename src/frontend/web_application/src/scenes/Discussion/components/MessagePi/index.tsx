import * as React from 'react';
import { Trans } from '@lingui/react';
import { getAveragePIMessage, PiScore } from 'src/modules/pi';
import { isMessageEncrypted } from 'src/services/encryption';
import { Message } from 'src/modules/message';
import './style.scss';

interface Props {
  message: Message;
  describe?: boolean;
}
export default function MessagePi({ message, describe }: Props) {
  if (!message.pi_message) {
    return null;
  }

  const piAggregate = getAveragePIMessage({ message });
  return (
    <div className="m-message-pi">
      <PiScore average={piAggregate} className="m-message-pi__pi-score" />
      {describe && (
        <p className="m-message-pi__metaphor">
          {isMessageEncrypted(message) ? (
            <Trans
              id="message.pi.description.metaphor.encrypted"
              message="In real life this message would be somewhat equivalent to letter within an envelope."
            />
          ) : (
            <Trans
              id="message.pi.description.metaphor.unencrypted"
              message="In real life this message would be somewhat equivalent to a postal card visible by everyone."
            />
          )}
        </p>
      )}
    </div>
  );
}
