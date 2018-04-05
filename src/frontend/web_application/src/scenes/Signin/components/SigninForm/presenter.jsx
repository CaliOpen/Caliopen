import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'lingui-react';
import { usernameNormalizer } from '../../../../modules/user';
import { Link, FieldErrors, TextFieldGroup, Button, FormGrid, FormRow, FormColumn } from '../../../../components/';

import './style.scss';

const CONTEXT_SAFE = 'safe';
const CONTEXT_PUBLIC = 'public';
const CONTEXT_UNSECURE = 'unsecure';

function generateStateFromProps(props) {
  return {
    ...props.formValues,
  };
}

class SigninForm extends Component {
  static propTypes = {
    errors: PropTypes.shape({}),
    form: PropTypes.shape({}),
    onSubmit: PropTypes.func.isRequired,
    onChange: PropTypes.func,
    i18n: PropTypes.shape({}).isRequired,
  };

  static defaultProps = {
    errors: {},
    form: {},
    onChange: () => {},
  };

  state = {
    formValues: {
      username: '',
      password: '',
    },
  };

  componentWillMount() {
    this.setState(generateStateFromProps(this.props));
  }

  componentDidMount() {
    setTimeout(this.setValues(), 1);
  }

  componentWillReceiveProps(newProps) {
    this.setState(generateStateFromProps(newProps));
  }

  setValues = () => {
    const password = this.passwordInputRef.value;
    const username = this.usernameInputRef.value;
    this.setState({
      formValues: {
        password,
        username,
      },
    });
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    const { onChange } = this.props;

    this.setState(prevState => ({
      formValues: {
        ...prevState.formValues,
        [name]: value,
      },
    }), () => onChange());
  }

  createHandleSubmit = context => (ev) => {
    ev.preventDefault();
    const { formValues } = this.state;

    this.props.onSubmit(
      context,
      {
        ...formValues,
        username: usernameNormalizer(formValues.username),
      }
    );
  }

  render() {
    const { errors = {}, form, i18n } = this.props;

    return (
      <div className="s-signin">
        <FormGrid className="s-signin__form">
          <form method="post" {...form}>
            <FormRow>
              <FormColumn rightSpace={false} bottomSpace>
                <div className="s-signin__alpha" dangerouslySetInnerHTML={{ __html: i18n._('signup.limited_registration', { defaults: 'During alpha phase, signup is limited. Please register at <a href="https://welcome.caliopen.org">https://welcome.caliopen.org</a>.' }) }} />
              </FormColumn>
            </FormRow>
            { errors.global && (
              <FormRow>
                <FormColumn rightSpace={false} bottomSpace>
                  <FieldErrors errors={errors.global} />
                </FormColumn>
              </FormRow>
            )}
            <FormRow>
              <FormColumn rightSpace={false} bottomSpace>
                <TextFieldGroup
                  id="signin_username"
                  theme="contrasted"
                  label={i18n._('signin.form.username.label', { defaults: 'Username' })}
                  placeholder={i18n._('signin.form.username.placeholder', { defaults: 'username' })}
                  name="username"
                  value={this.state.username}
                  errors={errors.username}
                  onChange={this.handleInputChange}
                  inputRef={(input) => { this.usernameInputRef = input; }}
                />
              </FormColumn>
              <FormColumn rightSpace={false} bottomSpace>
                <TextFieldGroup
                  id="signin_password"
                  theme="contrasted"
                  label={i18n._('signin.form.password.label', { defaults: 'Password' })}
                  placeholder={i18n._('signin.form.password.placeholder', { defaults: 'password' })}
                  name="password"
                  type="password"
                  value={this.state.password}
                  errors={errors.password}
                  onChange={this.handleInputChange}
                  inputRef={(input) => { this.passwordInputRef = input; }}
                />
              </FormColumn>
            </FormRow>
            <FormRow>
              <FormColumn rightSpace={false} className="s-signin__action" bottomSpace>
                <Button
                  type="submit"
                  onClick={this.createHandleSubmit(CONTEXT_SAFE)}
                  display="expanded"
                  shape="plain"
                  className="s-signin__login-safe"
                >
                  <Trans id="signin.action.login_safe">I&apos;m in a safe place</Trans>
                </Button>
              </FormColumn>
            </FormRow>
            <FormRow>
              <FormColumn rightSpace={false} className="s-signin__action" bottomSpace>
                <Button
                  type="submit"
                  onClick={this.createHandleSubmit(CONTEXT_PUBLIC)}
                  display="expanded"
                  shape="plain"
                  className="s-signin__login-public"
                >
                  <Trans id="signin.action.login_public">I&apos;m in a public place</Trans>
                </Button>
              </FormColumn>
            </FormRow>
            <FormRow>
              <FormColumn rightSpace={false} className="s-signin__action" bottomSpace>
                <Button
                  type="submit"
                  onClick={this.createHandleSubmit(CONTEXT_UNSECURE)}
                  display="expanded"
                  shape="plain"
                  className="s-signin__login-unsecure"
                >
                  <Trans id="signin.action.login_unsecure">I&apos;m in a non private place</Trans>
                </Button>
              </FormColumn>
            </FormRow>
            <FormRow>
              <FormColumn rightSpace={false} className="s-signin__link">
                <Link to="/auth/forgot-password"><Trans id="signin.action.forgot_password">Forgot password?</Trans></Link>
              </FormColumn>
              {/* <FormColumn rightSpace={false}>
                <Link to="/auth/signup">
                  <Trans id="signin.create_an_account">Create an account</Trans>
                </Link>
              </FormColumn> */}
            </FormRow>
          </form>
        </FormGrid>
      </div>
    );
  }
}

export default SigninForm;
