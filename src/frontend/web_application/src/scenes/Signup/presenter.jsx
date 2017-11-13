import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import SignupForm from './components/SignupForm';
import formValidator, { getLocalizedErrors, ERR_INVALID_GLOBAL } from './form-validator';

const INVALID_FORM_REJECTION = 'INVALID_FORM_REJECTION';

class Signup extends Component {
  static propTypes = {
    onSignupSuccess: PropTypes.func.isRequired,
    settings: PropTypes.shape({}).isRequired,
    __: PropTypes.func.isRequired,
  };

  state = {
    errors: {},
  };

  resetErrorsState(fieldname) {
    this.setState(prevState => ({
      errors: {
        ...prevState.errors,
        [fieldname]: [],
      },
    }));
  }


  handleUsernameChange = (ev) => {
    const { value: username } = ev.target;
    if (username.length === 0) {
      this.resetErrorsState('username');
    }

    if (username.length >= 3) {
      this.resetErrorsState('username');
      const { __ } = this.props;
      formValidator.validate({ username }, __, 'username').catch(
        (errors) => {
          this.setState(prevState => ({
            errors: {
              ...prevState.errors,
              ...errors,
            },
          }));
        }
      );
    }
  }

  handleUsernameBlur = (ev) => {
    const { value: username } = ev.target;
    if (username.length === 0) {
      this.resetErrorsState('username');

      return;
    }

    const { __ } = this.props;

    formValidator.validate({ username }, __, 'usernameAvailability').catch((errors) => {
      this.setState(prevState => ({
        errors: {
          ...prevState.errors,
          ...errors,
        },
      }));
    });
  }

  handleSignup = (ev) => {
    const { __, settings } = this.props;
    formValidator.validate(ev.formValues, __, 'full')
      .catch((errors) => {
        this.setState({ errors });

        return Promise.reject(INVALID_FORM_REJECTION);
      })
      .then(() => axios.post('/auth/signup', {
        ...ev.formValues,
        settings,
      }, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      }))
      .then(this.handleSignupSuccess, this.handleSignupError);
  }

  handleSignupSuccess = () => {
    const { onSignupSuccess } = this.props;
    onSignupSuccess('/');
  }

  handleSignupError = (err) => {
    if (err === INVALID_FORM_REJECTION) {
      return;
    }

    const isExpectedError = err.response &&
      err.response.status >= 400 &&
      err.response.status < 500 &&
      err.response.data.errors;

    if (!isExpectedError) {
      throw err;
    }

    const { __ } = this.props;
    const localizedErrors = getLocalizedErrors(__);

    const getLocalizedError = (msg, field) =>
      localizedErrors[`${msg}_${field.toUpperCase()}`] ||
      localizedErrors[ERR_INVALID_GLOBAL];

    const { errors = [] } = err.response.data;
    const global = Object.keys(errors).reduce((prev, field) => ([
      ...prev,
      ...errors[field].map(msg => getLocalizedError(msg, field)),
    ]), []);

    if (global.length === 0) {
      global.push(localizedErrors[ERR_INVALID_GLOBAL]);
    }
    this.setState({ errors: { global } });
  }

  render() {
    return (
      <SignupForm
        onUsernameChange={this.handleUsernameChange}
        onUsernameBlur={this.handleUsernameBlur}
        onSubmit={this.handleSignup}
        errors={this.state.errors}
      />
    );
  }
}

export default Signup;
