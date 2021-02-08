import { Component } from 'react';
import PropTypes from 'prop-types';
import { isAuthenticated } from '../../../user';

class WithSettings extends Component {
  static propTypes = {
    render: PropTypes.func.isRequired,
    synced: PropTypes.bool,
    requestSettings: PropTypes.func.isRequired,
    settings: PropTypes.shape({}),
    isInvalidated: PropTypes.bool.isRequired,
    didLostAuth: PropTypes.bool.isRequired,
    isFetching: PropTypes.bool.isRequired,
    networkDisabled: PropTypes.bool,
  };

  static defaultProps = {
    settings: undefined,
    synced: false,
    networkDisabled: false,
  };

  componentDidMount() {
    const {
      settings,
      requestSettings,
      isInvalidated,
      isFetching,
      networkDisabled,
    } = this.props;

    if (
      !networkDisabled &&
      (!settings || isInvalidated) &&
      !isFetching &&
      isAuthenticated()
    ) {
      requestSettings();
    }
  }

  render() {
    const { synced, render, settings, isFetching, didLostAuth } = this.props;

    if (synced && !settings) {
      return null;
    }

    return render(settings, isFetching, didLostAuth);
  }
}

export default WithSettings;
