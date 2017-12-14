import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import getClient from '../../services/api-client';

const STATUS_ERROR = 424;
const STATUS_INVALID_FORM = 400;
const ERROR_IDENTIFIANTS_MISMATCH = '[RESTfacility] username and recovery email mismatch';
const ERROR_USER_NOT_FOUND = '[RESTfacility] user not found';

class ForgotPassword extends Component {
  static propTypes = {
    __: PropTypes.func.isRequired,
  };

  state = {
    errors: {},
    isSuccess: false,
  };

  handleSuccess = () => {
    this.setState({ isSuccess: true });
  }

  handleSubmit = (ev) => {
    this.setState({ errors: {} });

    getClient().post('/v2/passwords/reset', {
      ...ev.formValues,
    }).then(this.handleSigninSuccess, this.handleSigninError);
  }

  handleSigninSuccess = () => {
    this.setState({
      isSuccess: true,
    });
  }

  handleSigninError = ({ response: { status, data: { errors: globalErrors } } }) => {
    const { __ } = this.props;

    if (![STATUS_ERROR, STATUS_INVALID_FORM].includes(status)) {
      throw new Error('Unexpected error');
    }

    const localizedErrors = {
      [ERROR_IDENTIFIANTS_MISMATCH]: __('passwords.form.error.identifiants_mismatch'),
      [ERROR_USER_NOT_FOUND]: __('passwords.form.error.user_not_found'),
      [STATUS_INVALID_FORM]: __('passwords.form.error.empty'),
    };

    const errors = {
      global: globalErrors.map(error => (
        localizedErrors[error.message] || localizedErrors[error.code]
      )),
    };

    this.setState({
      isSuccess: false,
      errors,
    });
  }

  render() {
    return (
      <ForgotPasswordForm
        onSubmit={this.handleSubmit}
        errors={this.state.errors}
        success={this.state.isSuccess}
      />
    );
  }
}

export default ForgotPassword;
