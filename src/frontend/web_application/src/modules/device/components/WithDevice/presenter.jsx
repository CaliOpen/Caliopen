import { Component } from 'react';
import PropTypes from 'prop-types';
import { getConfig, getPublicDevice } from '../../services/storage';
import { getKeypair } from '../../services/ecdsa';

class WithDevice extends Component {
  static propTypes = {
    render: PropTypes.func.isRequired,
    requestDevice: PropTypes.func.isRequired,
  };

  state = {
    initialized: false,
    clientDevice: undefined,
  };

  componentDidMount() {
    this.initialize();
  }

  UNSAFE_componentWillReceiveProps() {
    this.initialize();
  }

  initialize = async () => {
    if (this.state.initialized) {
      return;
    }

    const config = getConfig();
    if (!config) {
      return;
    }

    const { id, priv } = config;

    const keypair = getKeypair(priv);
    const clientDevice = getPublicDevice({ id, keypair });
    await this.setState({ clientDevice, initialized: true });
  };

  requestDevice = () => {
    const { requestDevice } = this.props;

    return requestDevice({ deviceId: this.state.clientDevice.device_id });
  };

  render() {
    const { render } = this.props;

    return render({
      requestDevice: this.requestDevice,
      clientDevice: this.state.clientDevice,
    });
  }
}

export default WithDevice;
