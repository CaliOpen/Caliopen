import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { PasswordStrength, TextFieldGroup, FormGrid, FieldErrors, FormColumn, FormRow } from '../../../../components/form';
import Section from '../../../../components/Section';
import Button from '../../../../components/Button';
import Link from '../../../../components/Link';
import Icon from '../../../../components/Icon';

import './style.scss';

class ResetPasswordForm extends Component {
  static propTypes = {
    __: PropTypes.func.isRequired,
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
  }

  componentDidMount() {
    import(/* webpackChunkName: "zxcvbn" */ 'zxcvbn').then((zxcvbn) => {
      this.zxcvbn = zxcvbn;
    });
  }

  calcPasswordStrengh = () => {
    if (this.zxcvbn) {
      this.setState((prevState) => {
        const { password } = prevState.formValues;
        const passwordStrength = !password.length ? '' : this.zxcvbn(password).score;

        return {
          ...prevState,
          passwordStrength,
        };
      });
    }
  }

  handlePasswordChange = (event) => {
    const value = event.target.value;
    this.setState(prevState => ({
      ...prevState,
      formValues: {
        password: value,
      },
    }));
    this.calcPasswordStrengh();
  }

  handleConfirmPasswordChange = (event) => {
    const { __ } = this.props;
    const value = event.target.value;

    this.setState((prevState) => {
      const password = prevState.formValues.password;
      const error = __('password.form.new_password_confirmation.error');
      const passwordError = password === value ? [] : [error];

      return {
        confirmPassword: value,
        formErrors: {
          passwordError,
        },
      };
    });
  }

  handleSubmit = (ev) => {
    ev.preventDefault();
    const { formValues } = this.state;
    this.props.onSubmit({ formValues });
  }

  renderSuccess() {
    const { __ } = this.props;

    return (
      <div className="m-reset-password-form__success">
        <Icon type="check" rightSpaced />{__('password.reset-form.success')}
      </div>
    );
  }

  renderInvalid() {
    const { __ } = this.props;

    return (
      <div className="m-reset-password-form__error">
        {__('reset-password.form.errors.token_not_found')}
      </div>
    );
  }

  renderForm() {
    const { __, errors } = this.props;

    const submitButtonProps = {
      // enable submitButton only if password and confirmPassword are matching
      disabled: this.state.formValues.password !== '' &&
      (this.state.formValues.password === this.state.confirmPassword) ? null : true,
    };

    return (
      <FormGrid className="m-reset-password-form">
        <form method="post" name="reset-password-form" onSubmit={this.handleSubmit}>
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
                name="password"
                type="password"
                value={this.state.formValues.password}
                onChange={this.handlePasswordChange}
                label={__('password.form.new_password.label')}
                placeholder={__('password.form.new_password.placeholder')}
                required
              />
            </FormColumn>
            {this.state.passwordStrength.length !== 0 && (
              <FormColumn rightSpace={false} bottomSpace>
                <PasswordStrength strength={this.state.passwordStrength} />
              </FormColumn>
            )}
            <FormColumn rightSpace={false} bottomSpace>
              <TextFieldGroup
                name="confirmPassword"
                type="password"
                value={this.state.confirmPassword}
                onChange={this.handleConfirmPasswordChange}
                errors={this.state.formErrors.passwordError}
                label={__('password.form.new_password_confirmation.label')}
                placeholder={__('password.form.new_password_confirmation.placeholder')}
                required
              />
            </FormColumn>
            <FormColumn className="m-reset-password-form__action" rightSpace={false}>
              <Button shape="plain" display="expanded" type="submit" {...submitButtonProps}>
                {__('password.form.action.validate')}
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
    const { __ } = this.props;

    return (
      <Section title={__('password.reset-form.title')} className="m-reset-password-form">
        {this.renderSection()}
        <div>
          <Link to="/auth/signin">{__('password.action.go_signin')}</Link>
        </div>
      </Section>
    );
  }
}

export default ResetPasswordForm;
