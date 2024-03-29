import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Trans } from '@lingui/react';
import { Spinner, Link, Section } from '../../components';
import './style.scss';

const STATUS_IN_PROGRESS = 'in_progress';
const STATUS_SUCCEED = 'succeed';
const STATUS_FAILED = 'failed';

class ValidateDevice extends Component {
  static propTypes = {
    className: PropTypes.string,
    match: PropTypes.shape({
      params: PropTypes.shape({
        token: PropTypes.string,
      }).isRequired,
    }).isRequired,
    requestDeviceVerification: PropTypes.func.isRequired,
  };

  static defaultProps = {
    className: undefined,
  };

  state = {
    status: undefined,
  };

  componentDidMount() {
    this.init();
  }

  init = async () => {
    if (this.state.status !== undefined) {
      return;
    }

    try {
      const {
        requestDeviceVerification,
        match: {
          params: { token },
        },
      } = this.props;
      this.setState({
        status: STATUS_IN_PROGRESS,
      });
      await requestDeviceVerification({ token });
      this.setState({
        status: STATUS_SUCCEED,
      });
    } catch (e) {
      this.setState({
        status: STATUS_FAILED,
      });
    }
  };

  renderVerification() {
    switch (this.state.status) {
      default:
      case STATUS_IN_PROGRESS:
        return (
          <Section
            className="s-validate-device__feedback"
            borderContext="disabled"
          >
            <Spinner svgTitleId="device-verification-spinner" isLoading />{' '}
            <Trans id="device.validation.in_progress" message="In progress." />
          </Section>
        );
      case STATUS_SUCCEED:
        return (
          <Section className="s-validate-device__feedback" borderContext="safe">
            <Trans
              id="device.validation.suceed"
              message="The device is now verified, you can continue to use <0>Caliopen</0>"
              components={[<Link to="/" />]}
            />
          </Section>
        );
      case STATUS_FAILED:
        return (
          <Section
            className="s-validate-device__feedback"
            borderContext="unsecure"
          >
            <Trans
              id="device.validation.failed"
              message={`
              The device cannot be verified, the validation link might not be
              valid anymore or may be the device has been revoked.
              <0 />
              You can send the verification link from
              <1>the device list</1>.
              `}
              components={[<br />, <Link to="/settings/devices" />]}
            />
          </Section>
        );
    }
  }

  render() {
    const { className } = this.props;

    return (
      <div className={classnames(className, 's-validate-device')}>
        {this.renderVerification()}
      </div>
    );
  }
}

export default ValidateDevice;
