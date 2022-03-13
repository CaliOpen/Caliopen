import { Component } from 'react';
import PropTypes from 'prop-types';

class WithIdentities extends Component {
  static propTypes = {
    render: PropTypes.func.isRequired,
    identities: PropTypes.arrayOf(PropTypes.shape({})),
    remoteIsFetching: PropTypes.bool,
    getIdentities: PropTypes.func.isRequired,
    localIsFetching: PropTypes.bool,
  };

  static defaultProps = {
    identities: undefined,
    remoteIsFetching: false,
    localIsFetching: false,
  };

  componentDidMount() {
    const { remoteIsFetching, getIdentities, localIsFetching } = this.props;

    if (!remoteIsFetching && !localIsFetching) {
      getIdentities();
    }
  }

  render() {
    console.warn('DEPRECATED: useIdentities instead');

    const { render, identities, remoteIsFetching, localIsFetching } =
      this.props;

    const isFetching = remoteIsFetching || localIsFetching;

    return render({ identities, isFetching });
  }
}

export default WithIdentities;
