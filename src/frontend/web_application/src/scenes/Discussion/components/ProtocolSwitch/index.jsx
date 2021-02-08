import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import { getPiClass } from '../../../../modules/pi';

import './style.scss';

class ProtocolSwitch extends PureComponent {
  static propTypes = {
    newProtocol: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    pi: PropTypes.number.isRequired,
    settings: PropTypes.shape({ default_locale: PropTypes.string.isRequired })
      .isRequired,
  };

  protocolIcon = (protocol) => {
    switch (protocol) {
      case 'facebook':
        return 'facebook-square';
      case 'twitter':
        return 'twitter';
      case 'mastodon':
        return 'mastodon';
      case 'sms':
        return 'phone';
      case 'email':
        return 'envelope';
      default:
        return 'comment';
    }
  };

  render() {
    const {
      pi,
      newProtocol,
      date,
      settings: { default_locale: locale },
    } = this.props;

    return (
      <div className={`m-protocol-switch ${getPiClass(pi)}`}>
        <div className="m-protocol-switch__bar" />
        <i className={`fa fa-${this.protocolIcon(newProtocol)}`} />
        &nbsp;
        <Moment fromNow locale={locale}>
          {date}
        </Moment>
      </div>
    );
  }
}

export default ProtocolSwitch;
