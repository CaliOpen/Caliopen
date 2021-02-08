import { Component } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidV4 } from 'uuid';
import { getConfig, save } from '../../services/storage';
import { generate } from '../../services/ecdsa';

class DeviceProvider extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    setDeviceGenerated: PropTypes.func.isRequired,
  };

  static defaultProps = {};

  componentDidMount() {
    this.initializeClient();
  }

  initializeClient = async () => {
    const config = getConfig();

    if (!config) {
      await this.generateAndHoldKeyPair();
      this.props.setDeviceGenerated(true);
    }
  };

  generateAndHoldKeyPair = async () => {
    const keypair = await generate();
    save({ id: uuidV4(), keypair });
  };

  render() {
    const { children } = this.props;

    return children;
  }
}

export default DeviceProvider;
