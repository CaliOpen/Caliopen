import * as React from 'react';
import { Trans, useLingui } from '@lingui/react';
import classnames from 'classnames';
import { Icon, TextBlock } from 'src/components';
import { getAveragePIMessage, getPiClass } from 'src/modules/pi';
import { isMessageEncrypted } from 'src/services/encryption';
import { Message } from 'src/modules/message';

// @ts-ignore
import simpleEnvelope from './assets/simple-envelope.png';
// XXX uncomment when messages will be signed
// import sealedEnvelope from './assets/sealed-envelope.png';
// @ts-ignore
import postalCard from './assets/postal-card.png';

import './style.scss';

const getIndexIconType = (aspect: number) => {
  switch (true) {
    case Number.isNaN(aspect):
      return 'question';
    case aspect <= 33:
      return 'times';
    case aspect <= 66:
      return 'warning';
    default:
      return 'check';
  }
};

interface Props {
  message: Message;
  illustrate: boolean;
  describe: boolean;
}
export default function MessagePi({ message, illustrate, describe }: Props) {
  const { i18n } = useLingui();

  const renderIllustrationImg = () => {
    if (isMessageEncrypted(message)) {
      return (
        <img
          src={simpleEnvelope}
          alt={i18n._(/* i18n */ 'message.img.simple-envelope', undefined, {
            message: 'This message is like a sealed envelop',
          })}
        />
      );
    }

    return (
      <img
        src={postalCard}
        alt={i18n._(/* i18n */ 'message.img.postal-card', undefined, {
          message: 'This message is like a postal card',
        })}
      />
    );
  };

  if (!message.pi_message) {
    return null;
  }

  const piAggregate = getAveragePIMessage({ message });
  const piClass = getPiClass(piAggregate);
  const piValue = Number.isFinite(piAggregate) ? Math.round(piAggregate) : '?';
  const progressMeterStyle = piAggregate
    ? {
        width: `${piAggregate}%`,
      }
    : {};

  return (
    <div className="m-message-pi">
      {illustrate && (
        <div className="m-message-pi__illustration">
          {renderIllustrationImg()}
          <ul className="m-message-pi__types">
            <li className={getPiClass(message.pi_message.social)}>
              <TextBlock inline>
                <Icon type={getIndexIconType(message.pi_message.social)} />
                <Trans id="message.pi.comportment" message="Sender" />
              </TextBlock>
            </li>
            <li className={getPiClass(message.pi_message.content)}>
              <TextBlock inline>
                <Icon type={getIndexIconType(message.pi_message.content)} />
                <Trans id="message.pi.context" message="Departure" />
              </TextBlock>
            </li>
            <li className={getPiClass(message.pi_message.transport)}>
              <TextBlock inline>
                <Icon type={getIndexIconType(message.pi_message.transport)} />
                <Trans id="message.pi.technic" message="Travel" />
              </TextBlock>
            </li>
          </ul>
        </div>
      )}
      <div
        className={classnames('m-message-pi__meter', {
          'm-message-pi__meter--no-separator': !describe,
        })}
      >
        <div
          className={classnames([
            'm-message-pi__progress',
            `m-message-pi__progress--${piClass}`,
          ])}
          role="progressbar"
          aria-valuenow={piAggregate}
          aria-valuemax={100}
          tabIndex={0}
        >
          <div
            className={classnames(
              'm-message-pi__progress-meter',
              `m-message-pi__progress-meter--${piClass}`
            )}
            style={progressMeterStyle}
          />
        </div>
        <div className="m-message-pi__numeric">
          <span className="m-message-pi__numeric-legend">
            <Trans id="message.pi.label" message="Privacy index:" />
          </span>
          <span className="m-message-pi__numeric-value">{piValue}</span>
        </div>
      </div>
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
