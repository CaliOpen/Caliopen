import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import SigninForm from './components/SigninForm';
import getClient from '../../services/api-client';
import { STATUS_VERIFIED } from '../../modules/device';

const URL_DEVICES = '/settings/devices';

const getRedirect = (queryString) => {
  const paramRedirect = queryString.split(/[?|&]/).find(str => /^redirect/.test(str));

  return paramRedirect ? paramRedirect.split('=')[1] : undefined;
};

class Signin extends Component {
  static propTypes = {
    initSettings: PropTypes.func.isRequired,
    location: PropTypes.shape({}).isRequired,
    i18n: PropTypes.shape({}).isRequired,
    clientDevice: PropTypes.shape({}),
  };

  static defaultProps = {
    clientDevice: undefined,
  };

  state = {
    errors: {},
    isAuthenticated: false,
  };

  componentWillMount() {
    this.initTranslation();
  }

  initTranslation() {
    const { i18n } = this.props;
    this.localizedErrors = {
      ERR_REQUIRED_USERNAME: i18n._('signin.feedback.required_username', { defaults: 'A username is required' }),
      ERR_REQUIRED_PASSWORD: i18n._('signin.feedback.required_password', { defaults: 'A password is required' }),
      ERR_INVALID_GLOBAL: i18n._('signin.feedback.invalid', { defaults: 'Credentials are invalid' }),
    };
  }

  handleSignin = (context, formValues) => {
    const { clientDevice: device } = this.props;

    getClient().post('/auth/signin', {
      context,
      ...formValues,
      device,
    }).then(this.handleSigninSuccess, this.handleSigninError);
  }

  handleSigninSuccess = async (response) => {
    const { initSettings } = this.props;

    const nextState = {
      isAuthenticated: true,
    };

    if (response.data.device.status !== STATUS_VERIFIED) {
      nextState.redirectDevice = true;
    }

    initSettings();
    this.setState(nextState);
  }

  handleSigninError = (err) => {
    const isExpectedError = err.response &&
      err.response.status >= 400 &&
      err.response.status < 500 &&
      err.response.data.errors;

    if (isExpectedError) {
      this.setState({
        errors: { global: [this.localizedErrors.ERR_INVALID_GLOBAL] },
      });
    } else {
      throw err;
    }
  }

  handleChange = () => {
    this.setState({ errors: {} });
  }

  render() {
    if (this.state.isAuthenticated && this.state.redirectDevice) {
      return <Redirect push to={URL_DEVICES} />;
    }

    if (this.state.isAuthenticated) {
      const { location: { search } } = this.props;
      const redirect = getRedirect(search) || '/';

      return <Redirect push to={redirect} />;
    }

    return (
      <SigninForm
        onChange={this.handleChange}
        onSubmit={this.handleSignin}
        errors={this.state.errors}
      />
    );
  }
}

export default Signin;
