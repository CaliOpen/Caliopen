import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Redirect } from 'react-router-dom';
import { AppLoader } from '../../../../components';
import { isAuthenticated } from '../../../user';
import { withAuthenticatedProps } from './withAuthenticatedProps';

@withRouter
@withAuthenticatedProps()
class AuthenticatedLayout extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    user: PropTypes.shape({}),
    settings: PropTypes.shape({}),
    isFetching: PropTypes.bool.isRequired,
    location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
    didLostAuth: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    user: undefined,
    settings: undefined,
  };

  state = {
    initialized:
      !!this.props.user && !!this.props.settings && !this.props.isFetching,
  };

  componentDidUpdate(prevProps, prevState) {
    const { user, settings, isFetching } = this.props;
    if (!prevState.initialized && !!user && !!settings && !isFetching) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        initialized: true,
      });
    }
  }

  render() {
    const {
      user,
      settings,
      children,
      location: { pathname },
      didLostAuth,
    } = this.props;

    const redirectRequired = !isAuthenticated();

    if (redirectRequired && pathname === '/') {
      return <Redirect push to="/about" />;
    }

    if (didLostAuth || redirectRequired) {
      return <Redirect push to={`/auth/signin?redirect=${pathname}`} />;
    }

    const appLoadProps = {
      isLoading: !this.state.initialized,
      hasFailure: this.state.initialized && (!user || !settings),
      fallbackUrl: pathname,
      children,
    };

    return <AppLoader {...appLoadProps} />;
  }
}

export default AuthenticatedLayout;
