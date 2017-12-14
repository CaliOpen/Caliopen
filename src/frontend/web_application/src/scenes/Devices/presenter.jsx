import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Link from '../../components/Link';
import Icon from '../../components/Icon';
import NavList, { ItemContent } from '../../components/NavList';
import PageTitle from '../../components/PageTitle';

import './style.scss';

class Devices extends Component {
  static propTypes = {
    devices: PropTypes.arrayOf(PropTypes.shape({})),
    requestDevices: PropTypes.func.isRequired,
    children: PropTypes.node,
    params: PropTypes.shape({ }),
    __: PropTypes.func.isRequired,
  };

  static defaultProps = {
    devices: [],
    params: { params: { deviceId: null } },
    children: null,
  };

  componentDidMount() {
    this.props.requestDevices();
  }

  renderDevice(device) {
    const { params: { deviceId } } = this.props;
    const isVerified = device.signature_key && true;

    return (
      <ItemContent key={device.device_id} active={device.device_id === deviceId}>
        <Link
          to={`/settings/devices/${device.device_id}`}
          className={classnames('s-devices__nav-item', { 's-devices__nav-item--verify': !isVerified })}
          active={device.device_id === deviceId}
          expanded
        >
          {!isVerified ?
            <Icon type="exclamation-triangle" spaced /> :
            <Icon type="check" spaced />
          }
          {device.name}
        </Link>
      </ItemContent>
    );
  }

  render() {
    const { devices, children, __ } = this.props;

    return (
      <div className="s-devices">
        <PageTitle />
        <NavList className="s-devices__nav" dir="vertical">
          {devices.map(device => this.renderDevice(device))}
        </NavList>
        <section className="s-devices__device">
          {!children ? __('device.no-selected-device') : children}
        </section>
      </div>
    );
  }
}

export default Devices;
