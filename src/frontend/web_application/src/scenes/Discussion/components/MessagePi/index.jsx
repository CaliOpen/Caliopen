import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'lingui-react';
import classnames from 'classnames';
import { getAveragePI, getPiClass } from '../../../../modules/pi/services/pi';

import sealedEnvelope from './assets/sealed-envelope.png';
import postalCard from './assets/postal-card.png';

import './style.scss';

class MessagePi extends PureComponent {
  static propTypes = {
    pi: PropTypes.shape({}).isRequired,
    illustrate: PropTypes.bool,
    describe: PropTypes.bool,
  };

  static defaultProps = {
    illustrate: false,
    describe: false,
  };

  componentDidMount() {
    this.strongSrc = sealedEnvelope;
    this.weakSrc = postalCard;
  }

  // FIXME: Ugly implenentation.
  getPiQualities = ({ pi }) => {
    /* eslint-disable no-nested-ternary */
    // XXX: temp stuff waiting for actual spec
    const labelFor = aspect => (aspect <= 33 ? 'bad' : aspect <= 66 ? 'warn' : 'ok');
    const iconFor = aspect => (aspect <= 33 ? 'fa-times' : aspect <= 66 ? 'fa-warning' : 'fa-check');
    /* eslint-enable no-nested-ternary */
    const { technic, context, comportment } = pi || { technic: 0, context: 0, comportment: 0 };

    return {
      technic: { label: labelFor(technic), icon: iconFor(technic) },
      context: { label: labelFor(context), icon: iconFor(context) },
      comportment: { label: labelFor(comportment), icon: iconFor(comportment) },
    };
  }

  getPiImg = ({ pi }) => (getAveragePI(pi) <= 50 ? postalCard : sealedEnvelope);

  strongSrc = '';
  weakSrc = '';

  renderIllustration() {
    const { pi } = this.props;
    const piQualities = this.getPiQualities({ pi });

    return (
      <div className="m-message-pi__illustration">
        <img src={this.getPiImg({ pi })} alt="" />
        <ul className="m-message-pi__types">
          <li className={piQualities.comportment.label}>
            <i className={`fa ${piQualities.comportment.icon}`} />
            <span>Expéditeur</span>
          </li>
          <li className={piQualities.context.label}>
            <i className={`fa ${piQualities.context.icon}`} />
            <span>Départ</span>
          </li>
          <li className={piQualities.technic.label}>
            <i className={`fa ${piQualities.technic.icon}`} />
            <span>Trajet</span>
          </li>
        </ul>
      </div>
    );
  }

  renderDescription = () => (
    <p className="m-message-pi__metaphor">
      <Trans>
        Dans la vraie vie, ce message serait plus ou moins l&apos;équivalent d&apos;
        une carte postale visible par tous.
      </Trans>
    </p>
  );

  render() {
    const { illustrate, describe, pi } = this.props;
    const piAggregate = getAveragePI(pi);

    return (
      <div className="m-message-pi">
        {illustrate ? this.renderIllustration() : null}
        <div className="m-message-pi__meter">
          <div
            className={classnames(['m-message-pi__progress', `m-message-pi__progress--${getPiClass(piAggregate)}`])}
            role="progressbar"
            aria-valuenow={piAggregate}
            aria-valuemax="100"
            tabIndex="0"
          >
            <div
              className={classnames('m-message-pi__progress-meter', `m-message-pi__progress-meter--${getPiClass(piAggregate)}`)}
              style={{ width: `${piAggregate}%` }}
            />
          </div>
          <div className="m-message-pi__numeric">
            <span className="m-message-pi__numeric-legend">Privacy index&thinsp;:</span>
            <span className="m-message-pi__numeric-value">{Math.round(piAggregate)}</span>
          </div>
        </div>
        {describe ? this.renderDescription() : null}
      </div>
    );
  }
}

export default MessagePi;