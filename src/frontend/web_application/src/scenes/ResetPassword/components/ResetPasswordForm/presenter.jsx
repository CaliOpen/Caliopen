import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import {
  Section,
  Link,
  PasswordStrength,
  Button,
  Icon,
  FieldErrors,
  TextFieldGroup,
  FormGrid,
  FormColumn,
  FormRow,
} from '../../../../components';

import './style.scss';

class ResetPasswordForm extends Component {
  static propTypes = {
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    errors: PropTypes.shape({}),
    onSubmit: PropTypes.func.isRequired,
    success: PropTypes.bool,
    valid: PropTypes.bool,
  };

  static defaultProps = {
    errors: {},
    success: false,
    valid: true,
  };

  state = {
    formErrors: {
      passwordError: [],
    },
    confirmPassword: '',
    passwordStrength: '',
    formValues: {
      password: '',
    },
  };

  componentDidMount() {
    import(/* webpackChunkName: "zxcvbn" */ 'zxcvbn').then(
      ({ default: zxcvbn }) => {
        this.zxcvbn = zxcvbn;
      }
    );
  }

  calcPasswordStrengh = () => {
    if (this.zxcvbn) {
      this.setState((prevState) => {
        const { password } = prevState.formValues;
        const passwordStrength = !password.length
          ? ''
          : this.zxcvbn(password).score;

        return {
          ...prevState,
          passwordStrength,
        };
      });
    }
  };

  handlePasswordChange = (event) => {
    const { value } = event.target;
    this.setState((prevState) => ({
      ...prevState,
      formValues: {
        password: value,
      },
    }));
    this.calcPasswordStrengh();
  };

  handleConfirmPasswordChange = (event) => {
    const { i18n } = this.props;
    const { value } = event.target;

    this.setState((prevState) => {
      const { password } = prevState.formValues;
      const error = i18n._(
        /* i18n */ 'password.form.new_password_confirmation.error',
        null,
        { message: "Passwords don't match" }
      );
      const passwordError = password === value ? [] : [error];

      return {
        confirmPassword: value,
        formErrors: {
          passwordError,
        },
      };
    });
  };

  handleSubmit = (ev) => {
    ev.preventDefault();
    const { formValues } = this.state;
    this.props.onSubmit({ formValues });
  };

  renderSuccess = () => (
    <div className="m-reset-password-form__success">
      <Icon type="check" rightSpaced />
      <Trans id="password.reset-form.success" message="Done!" />
    </div>
  );

  renderInvalid = () => (
    <div className="m-reset-password-form__error">
      <Trans
        id="reset-password.form.errors.token_not_found"
        message="Token is no more valid. Please retry."
      />
    </div>
  );

  renderForm() {
    const { i18n, errors } = this.props;

    const submitButtonProps = {
      // enable submitButton only if password and confirmPassword are matching
      disabled:
        this.state.formValues.password !== '' &&
        this.state.formValues.password === this.state.confirmPassword
          ? null
          : true,
    };

    return (
      <FormGrid className="m-reset-password-form">
        <form
          method="post"
          name="reset-password-form"
          onSubmit={this.handleSubmit}
        >
          {errors.global && (
            <FormRow>
              <FormColumn rightSpace={false} bottomSpace>
                <FieldErrors errors={errors.global} />
              </FormColumn>
            </FormRow>
          )}
          <FormRow>
            <FormColumn rightSpace={false} bottomSpace>
              <TextFieldGroup
                inputProps={{
                  name: 'password',
                  type: 'password',
                  value: this.state.formValues.password,
                  onChange: this.handlePasswordChange,
                  placeholder: i18n._(
                    /* i18n */ 'password.form.new_password.placeholder',
                    null,
                    { message: 'Enter new password' }
                  ),
                  required: true,
                  theme: 'contrasted',
                }}
                label={i18n._(
                  /* i18n */ 'password.form.new_password.label',
                  null,
                  {
                    message: 'New password:',
                  }
                )}
              />
            </FormColumn>
            {this.state.passwordStrength.length !== 0 && (
              <FormColumn rightSpace={false} bottomSpace>
                <PasswordStrength strength={this.state.passwordStrength} />
              </FormColumn>
            )}
            <FormColumn rightSpace={false} bottomSpace>
              <TextFieldGroup
                inputProps={{
                  name: 'confirmPassword',
                  type: 'password',
                  value: this.state.confirmPassword,
                  onChange: this.handleConfirmPasswordChange,
                  placeholder: i18n._(
                    /* i18n */ 'password.form.new_password_confirmation.placeholder',
                    null,
                    { message: 'Password' }
                  ),
                  required: true,
                  theme: 'contrasted',
                }}
                errors={this.state.formErrors.passwordError}
                label={i18n._(
                  /* i18n */ 'password.form.new_password_confirmation.label',
                  null,
                  { message: 'New password confirmation:' }
                )}
              />
            </FormColumn>
            <FormColumn
              className="m-reset-password-form__action"
              rightSpace={false}
            >
              <Button
                shape="plain"
                display="expanded"
                type="submit"
                {...submitButtonProps}
              >
                <Trans
                  id="password.form.action.validate"
                  message="Apply modifications"
                />
              </Button>
            </FormColumn>
          </FormRow>
        </form>
      </FormGrid>
    );
  }

  renderSection() {
    const { valid, success } = this.props;
    switch (true) {
      case !valid:
        return this.renderInvalid();
      case success:
        return this.renderSuccess();
      default:
        return this.renderForm();
    }
  }

  render() {
    const { i18n } = this.props;

    return (
      <Section
        title={i18n._(/* i18n */ 'password.reset-form.title', null, {
          message: 'Reset your password',
        })}
        className="m-reset-password-form"
      >
        {this.renderSection()}
        <div>
          <Link to="/auth/signin">
            <Trans id="password.action.go_signin" message="Signin" />
          </Link>
        </div>
      </Section>
    );
  }
}

export default ResetPasswordForm;
