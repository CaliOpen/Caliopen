import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans, withI18n } from '@lingui/react';
import { Redirect, withRouter } from 'react-router-dom';
import { usernameNormalizer } from '../../services/usernameNormalizer';
import { withDevice, STATUS_VERIFIED } from '../../../device';
import {
  Link,
  Spinner,
  FieldErrors,
  TextFieldGroup,
  Button,
  FormGrid,
  FormRow,
  FormColumn,
} from '../../../../components';
import getClient from '../../../../services/api-client';
import './style.scss';

const CONTEXT_SAFE = 'safe';
// const CONTEXT_PUBLIC = 'public';
// const CONTEXT_UNSECURE = 'unsecure';

const URL_DEVICES = '/settings/new-device';

const getRedirect = (queryString) => {
  const paramRedirect = queryString
    .split(/[?|&]/)
    .find((str) => /^redirect/.test(str));

  return paramRedirect ? paramRedirect.split('=')[1] : undefined;
};

@withRouter
@withI18n()
@withDevice()
class SigninForm extends Component {
  static propTypes = {
    form: PropTypes.shape({}),
    clientDevice: PropTypes.shape({}),
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    location: PropTypes.shape({
      search: PropTypes.string.isRequired,
    }).isRequired,
  };

  static defaultProps = {
    form: {},
    clientDevice: undefined,
  };

  state = {
    isMounted: false,
    isLoading: false,
    context: CONTEXT_SAFE,
    formValues: {
      username: '',
      password: '',
    },
    errors: {},
    isAuthenticated: false,
  };

  componentDidMount() {
    setTimeout(this.initialize(), 1);
  }

  initialize = () => {
    const password = this.passwordInputRef.value;
    const username = this.usernameInputRef.value;
    this.setState({
      isMounted: true,
      formValues: {
        password,
        username,
      },
    });
  };

  validate = (values) => {
    const errors = {};

    if (values.username.length === 0) {
      errors.username = [
        <Trans id="signin.feedback.required_username">
          A username is required
        </Trans>,
      ];
    }

    if (values.password.length === 0) {
      errors.password = [
        <Trans id="signin.feedback.required_password">
          A password is required
        </Trans>,
      ];
    }

    return errors;
  };

  handleSignin = (ev) => {
    ev.preventDefault();
    const { clientDevice: device } = this.props;
    const { formValues, context } = this.state;

    this.setState(
      (prevState) => {
        const errors = this.validate(prevState.formValues);
        const isLoading = Object.keys(errors).length === 0;

        return { errors, isLoading };
      },
      () => {
        if (Object.keys(this.state.errors).length > 0) {
          return;
        }

        getClient()
          .post('/auth/signin', {
            context,
            ...formValues,
            username: usernameNormalizer(formValues.username),
            device,
          })
          .then(this.handleSigninSuccess, this.handleSigninError)
          .finally(() => {
            this.setState({ isLoading: false });
          });
      }
    );
  };

  handleSigninSuccess = async (response) => {
    const nextState = {
      isAuthenticated: true,
    };

    if (response.data.device.status !== STATUS_VERIFIED) {
      nextState.redirectDevice = true;
    }

    this.setState(nextState);
  };

  handleSigninError = (err) => {
    const isExpectedError =
      err.response &&
      err.response.status >= 400 &&
      err.response.status < 500 &&
      err.response.data.errors;

    if (isExpectedError) {
      this.setState({
        errors: {
          global: [
            <Trans id="signin.feedback.invalid">Credentials are invalid</Trans>,
          ],
        },
      });
    } else {
      throw err;
    }
  };

  handleChange = () => {
    this.setState({ errors: {} });
  };

  handleInputChange = (event) => {
    const { name, value } = event.target;

    this.setState((prevState) => {
      const formValues = {
        ...prevState.formValues,
        [name]: value,
      };

      return {
        errors: this.validate(formValues),
        formValues,
      };
    });
  };

  render() {
    const {
      location: { search },
    } = this.props;
    const redirect = getRedirect(search) || '/';

    if (
      this.state.isAuthenticated &&
      this.state.redirectDevice &&
      !redirect.includes('/validate-device/')
    ) {
      return <Redirect push to={URL_DEVICES} />;
    }

    if (this.state.isAuthenticated) {
      return <Redirect push to={redirect} />;
    }

    const { form, i18n } = this.props;

    return (
      <div className="s-signin">
        <FormGrid className="s-signin__form">
          <form method="post" onSubmit={this.handleSignin} {...form}>
            {this.state.errors.global && (
              <FormRow>
                <FormColumn rightSpace={false} bottomSpace>
                  <FieldErrors errors={this.state.errors.global} />
                </FormColumn>
              </FormRow>
            )}
            <FormRow>
              <FormColumn rightSpace={false} bottomSpace>
                <TextFieldGroup
                  id="signin_username"
                  theme="contrasted"
                  label={i18n._('signin.form.username.label', null, {
                    defaults: 'Username',
                  })}
                  placeholder={i18n._(
                    'signin.form.username.placeholder',
                    null,
                    { defaults: 'username' }
                  )}
                  name="username"
                  value={this.state.username}
                  errors={this.state.errors.username}
                  onChange={this.handleInputChange}
                  inputRef={(input) => {
                    this.usernameInputRef = input;
                  }}
                />
              </FormColumn>
              <FormColumn rightSpace={false} bottomSpace>
                <TextFieldGroup
                  id="signin_password"
                  theme="contrasted"
                  label={i18n._('signin.form.password.label', null, {
                    defaults: 'Password',
                  })}
                  placeholder={i18n._(
                    'signin.form.password.placeholder',
                    null,
                    { defaults: 'password' }
                  )}
                  name="password"
                  type="password"
                  value={this.state.password}
                  errors={this.state.errors.password}
                  onChange={this.handleInputChange}
                  inputRef={(input) => {
                    this.passwordInputRef = input;
                  }}
                />
              </FormColumn>
            </FormRow>
            <FormRow>
              <FormColumn
                rightSpace={false}
                className="s-signin__action"
                bottomSpace
              >
                <Button
                  type="submit"
                  display="expanded"
                  shape="plain"
                  disabled={!this.state.isMounted || this.state.isLoading}
                  icon={
                    !this.state.isMounted || this.state.isLoading ? (
                      <Spinner isLoading display="inline" />
                    ) : undefined
                  }
                >
                  <Trans id="signin.action.login">Login</Trans>
                </Button>
              </FormColumn>
            </FormRow>
            <FormRow>
              <FormColumn rightSpace={false} className="s-signin__link">
                <Link to="/auth/forgot-password">
                  <Trans id="signin.action.forgot_password">
                    Forgot password?
                  </Trans>
                </Link>
              </FormColumn>
              <FormColumn rightSpace={false} className="s-signin__link">
                <Link to="/auth/signup">
                  <Trans id="signin.create_an_account">Create an account</Trans>
                </Link>
              </FormColumn>
            </FormRow>
          </form>
        </FormGrid>
      </div>
    );
  }
}

export default SigninForm;
