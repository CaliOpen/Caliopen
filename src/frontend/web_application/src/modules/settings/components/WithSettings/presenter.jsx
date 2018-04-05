import { Component } from 'react';
import PropTypes from 'prop-types';
import { isAuthenticated } from '../../../user';

class WithSettings extends Component {
  static propTypes = {
    render: PropTypes.func.isRequired,
    synced: PropTypes.bool,
    requestSettings: PropTypes.func.isRequired,
    settings: PropTypes.shape({}),
    isInvalidated: PropTypes.bool,
    isFetching: PropTypes.bool,
  };

  static defaultProps = {
    settings: undefined,
    synced: false,
    isInvalidated: false,
    isFetching: false,
  };

  componentDidMount() {
    const {
      settings, requestSettings, isInvalidated, isFetching,
    } = this.props;

    if ((!settings || isInvalidated) && !isFetching && isAuthenticated()) {
      requestSettings();
    }
  }

  render() {
    const {
      synced, render, settings, isFetching,
    } = this.props;

    if (synced && !settings) {
      return null;
    }

    return render(settings, isFetching);
  }
}

export default WithSettings;
