import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ResetPasswordForm from './components/ResetPasswordForm';
import getClient from '../../services/api-client';

const STATUS_TOKEN_NOT_FOUND = 404;
const STATUS_TOKEN_UNPROCESSABLE = 424;

class ResetPassword extends Component {
  static propTypes = {
    __: PropTypes.func.isRequired,
    match: PropTypes.shape({ params: PropTypes.shape({ key: PropTypes.string }) }),
  };

  state = {
    errors: {},
    isSuccess: false,
    isValid: true,
  };

  componentDidMount() {
    const { match: { params: { key } } } = this.props;

    getClient().get(`/v2/passwords/reset/${key}`).catch(({ response: { status } }) => {
      if (status !== STATUS_TOKEN_NOT_FOUND) {
        throw new Error('Unexpected error');
      }

      this.setState({
        isValid: false,
      });
    });
  }

  handleSubmit = (ev) => {
    this.setState({ errors: {} });
    const { match: { params: { key } } } = this.props;

    getClient().post(`/v2/passwords/reset/${key}`, {
      ...ev.formValues,
    }).then(this.handleSuccess, this.handleError);
  }

  handleError = ({ response: { status } }) => {
    if (status !== STATUS_TOKEN_UNPROCESSABLE) {
      throw new Error('Unexpected error');
    }

    const { __ } = this.props;

    const errors = {
      global: [__('reset-password.form.errors.token_not_found')],
    };
    this.setState({
      isSuccess: false,
      errors,
    });
  }

  handleSuccess = () => {
    this.setState({ isSuccess: true });
  }

  render() {
    return (
      <ResetPasswordForm
        onSubmit={this.handleSubmit}
        errors={this.state.errors}
        success={this.state.isSuccess}
        valid={this.state.isValid}
      />
    );
  }
}

export default ResetPassword;
