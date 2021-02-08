import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '../../../../components';

class IdentityDetails extends PureComponent {
  static propTypes = {
    identity: PropTypes.shape({}),
  };

  static defaultProps = {
    identity: null,
  };

  render() {
    const { identity } = this.props;

    return (
      <span className="m-identity-details">
        <Icon type={identity.type} rightSpaced />
        {identity.name}
      </span>
    );
  }
}

export default IdentityDetails;
