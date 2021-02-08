import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withI18n } from '@lingui/react';
import { withPush } from '../../../routing';
// prevent cycling deps
import withSettings from '../../../settings/hoc/withSettings';
import { withDevice } from '../../../device';
import { signup } from '../../services/signup';
import SignupForm from './components/SignupForm';
import formValidator, {
  getLocalizedErrors,
  ERR_UNABLE_TO_SIGNUP,
} from './form-validator';

@withSettings()
@withI18n()
@withDevice()
@withPush()
class Signup extends Component {
  static propTypes = {
    push: PropTypes.func.isRequired,
    settings: PropTypes.shape({}).isRequired,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    clientDevice: PropTypes.shape({}),
  };

  static defaultProps = {
    clientDevice: undefined,
  };

  state = {
    errors: {},
    isValidating: false,
  };

  usernameHasChanged = (username) => {
    if (username.length === 0) {
      this.resetErrorsState('username');
    }

    if (username.length >= 3) {
      this.resetErrorsState('username');
      const { i18n } = this.props;
      formValidator.validate({ username }, i18n, 'username').catch((errors) => {
        this.setState((prevState) => ({
          errors: {
            ...prevState.errors,
            ...errors,
          },
        }));
      });
    }
  };

  handleFieldChange = (fieldname, value) => {
    switch (fieldname) {
      case 'username':
        this.usernameHasChanged(value);
        break;
      default:
        if (this.state.errors[fieldname]) {
          this.resetErrorsState(fieldname);
        }
    }
  };

  handleFieldBlur = (fieldname, value) => {
    if (fieldname !== 'username') {
      return;
    }

    if (value.length === 0) {
      this.resetErrorsState('username');

      return;
    }

    const { i18n } = this.props;

    formValidator
      .validate({ username: value }, i18n, 'usernameAvailability')
      .catch((errors) => {
        this.setState((prevState) => ({
          errors: {
            ...prevState.errors,
            ...errors,
          },
        }));
      });
  };

  handleSignup = async (ev) => {
    const { clientDevice, i18n, settings } = this.props;
    try {
      this.setState({
        isValidating: true,
      });
      await formValidator.validate(ev.formValues, i18n, 'full');
    } catch (errors) {
      this.setState({
        errors,
        isValidating: false,
      });

      return undefined;
    }

    try {
      await signup({
        ...ev.formValues,
        device: clientDevice,
        settings,
      });
      const { push } = this.props;

      return push('/');
    } catch (err) {
      const isExpectedError =
        err.response && err.response.status >= 400 && err.response.status < 500;

      if (!isExpectedError) {
        throw err;
      }

      const localizedErrors = getLocalizedErrors(i18n);

      this.setState({
        errors: { global: [localizedErrors[ERR_UNABLE_TO_SIGNUP]] },
        isValidating: false,
      });

      return undefined;
    }
  };

  resetErrorsState(fieldname) {
    this.setState((prevState) => ({
      errors: {
        ...prevState.errors,
        [fieldname]: [],
      },
    }));
  }

  render() {
    return (
      <SignupForm
        onFieldChange={this.handleFieldChange}
        onFieldBlur={this.handleFieldBlur}
        onSubmit={this.handleSignup}
        errors={this.state.errors}
        isValidating={this.state.isValidating}
      />
    );
  }
}

export default Signup;
