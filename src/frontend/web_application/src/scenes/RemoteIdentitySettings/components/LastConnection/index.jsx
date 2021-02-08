import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import Moment from 'react-moment';
import { withSettings } from '../../../../modules/settings';

@withSettings()
class lastConnection extends PureComponent {
  static propTypes = {
    lastCheck: PropTypes.string,
    settings: PropTypes.shape({ default_locale: PropTypes.string.isRequired })
      .isRequired,
  };

  static defaultProps = {
    lastCheck: undefined,
  };

  render() {
    const {
      lastCheck,
      settings: { default_locale: locale },
    } = this.props;

    if (lastCheck && lastCheck.length) {
      return (
        <Moment fromNow locale={locale}>
          {lastCheck}
        </Moment>
      );
    }

    return <Trans id="remote_identity.last_connection.never">Never</Trans>;
  }
}

export default lastConnection;
