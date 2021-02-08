import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';

class Status extends PureComponent {
  static propTypes = {
    status: PropTypes.string.isRequired,
  };

  render() {
    const { status } = this.props;
    const statusLabels = {
      active: <Trans id="remote_identity.status.active">Enabled</Trans>,
      inactive: <Trans id="remote_identity.status.inactive">Disabled</Trans>,
    };

    return statusLabels[status];
  }
}

export default Status;
