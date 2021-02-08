import { Component } from 'react';
import PropTypes from 'prop-types';
import { isAuthenticated } from '../..';

class WithUser extends Component {
  static propTypes = {
    render: PropTypes.func.isRequired,
    getUser: PropTypes.func.isRequired,
    user: PropTypes.shape({}),
    didInvalidate: PropTypes.bool.isRequired,
    didLostAuth: PropTypes.bool.isRequired,
    isFetching: PropTypes.bool.isRequired,
    synced: PropTypes.bool,
  };

  static defaultProps = {
    user: undefined,
    synced: false,
  };

  componentDidMount() {
    const { user, getUser, didInvalidate, isFetching } = this.props;

    if ((!user || didInvalidate) && !isFetching && isAuthenticated()) {
      getUser();
    }
  }

  render() {
    const { render, user, isFetching, synced, didLostAuth } = this.props;

    if (synced && !user) {
      return null;
    }

    return render(user, isFetching, didLostAuth);
  }
}

export default WithUser;
