import { Component } from 'react';
import PropTypes from 'prop-types';

class WithProviders extends Component {
  static propTypes = {
    render: PropTypes.func.isRequired,
    requestProviders: PropTypes.func.isRequired,
    providers: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    isFetching: PropTypes.bool,
    didInvalidate: PropTypes.bool,
  };

  static defaultProps = {
    isFetching: false,
    didInvalidate: false,
  };

  componentDidMount() {
    const {
      providers,
      requestProviders,
      didInvalidate,
      isFetching,
    } = this.props;

    if ((!providers || didInvalidate) && !isFetching) {
      requestProviders();
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { requestProviders, didInvalidate, isFetching } = nextProps;

    if (didInvalidate && !isFetching) {
      requestProviders();
    }
  }

  render() {
    const { render, providers, isFetching } = this.props;

    return render({ providers, isFetching });
  }
}

export default WithProviders;
