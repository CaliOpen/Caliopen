import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { requestDevices as requestDevicesBase } from '../../actions/requestDevices';

const deviceStateSelector = (state) => state.device;
const devicesSelector = createSelector(deviceStateSelector, (deviceState) =>
  deviceState.devices.map((id) => deviceState.devicesById[id])
);
const mapStateToProps = createSelector(
  [deviceStateSelector, devicesSelector],
  ({ didInvalidate, isFetching }, devices) => ({
    devices,
    didInvalidate,
    isFetching,
  })
);
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      requestDevices: requestDevicesBase,
    },
    dispatch
  );

export const withDevices = () => (WrappedComponent) => {
  class WithDevices extends Component {
    static propTypes = {
      devices: PropTypes.arrayOf(PropTypes.shape({})),
      didInvalidate: PropTypes.bool,
      isFetching: PropTypes.bool,
      requestDevices: PropTypes.func.isRequired,
    };

    static defaultProps = {
      devices: undefined,
      didInvalidate: undefined,
      isFetching: false,
    };

    state = {};

    UNSAFE_componentWillMount() {
      const { isFetching, devices, didInvalidate, requestDevices } = this.props;
      if (!isFetching && (devices.length === 0 || didInvalidate)) {
        requestDevices();
      }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
      const { isFetching, devices, didInvalidate, requestDevices } = nextProps;
      if (!isFetching && (devices.length === 0 || didInvalidate)) {
        requestDevices();
      }
    }

    render() {
      const {
        devices,
        requestDevices,
        isFetching,
        didInvalidate,
        ...props
      } = this.props;

      const devicesProps = {
        devices,
        requestDevices,
        didInvalidate,
        isFetching,
      };

      return <WrappedComponent devicesProps={devicesProps} {...props} />;
    }
  }

  return connect(mapStateToProps, mapDispatchToProps)(WithDevices);
};
