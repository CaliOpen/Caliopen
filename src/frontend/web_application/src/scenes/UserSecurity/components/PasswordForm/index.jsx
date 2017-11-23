import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { PasswordStrength, TextFieldGroup, FormGrid, FormColumn, FormRow } from '../../../../components/form';
import Button from '../../../../components/Button';
import './style.scss';

class PasswordForm extends Component {
  static propTypes = {
    __: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
  };


  state = {
    passwordError: [],
    passwordConfirmation: '',
    passwordStrength: '',
    formValues: {
      password: '',
      newPassword: '',
      // tfa: '',
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
        const { newPassword } = prevState.formValues;
        const passwordStrength = !newPassword.length ? '' : this.zxcvbn(newPassword).score;

        return {
          ...prevState,
          passwordStrength,
        };
      });
    }
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState(prevState => ({
      formValues: {
        ...prevState.formValues,
        [name]: value,
      },
    }));
  }

  handleNewPasswordChange = (event) => {
    this.handleInputChange(event);
    this.calcPasswordStrengh();
  }

  handleConfirmPasswordChange = (event) => {
    const { __ } = this.props;
    const { value } = event.target;

    this.setState((prevState) => {
      const newPassword = prevState.formValues.newPassword;
      const error = __('password.form.new_password_confirmation.error');
      const passwordError = newPassword === value ? [] : [error];

      return {
        ...prevState,
        passwordConfirmation: value,
        passwordError,
      };
    });
  }

  handleSubmit = () => {
    const { formValues } = this.state;
    const user = { password: formValues.newPassword };
    const original = { password: formValues.password };

    const data = {
      ...user,
      current_state: {
        ...original,
      },
    };

    this.props.onSubmit(data);
  }

  render() {
    const { __, onCancel } = this.props;

    const submitButtonProps = {
      disabled: this.state.formValues.newPassword !== '' && this.state.formValues.password !== '' &&
      (this.state.formValues.newPassword === this.state.passwordConfirmation) ? null : true,
    };

    return (
      <FormGrid className="m-password-form">
        <FormRow className="m-password-form__row">
          <FormColumn size="medium">
            <TextFieldGroup
              name="password"
              type="password"
              onChange={this.handleInputChange}
              label={__('password.form.current_password.label')}
              placeholder={__('password.form.current_password.placeholder')}
              showLabelforSr
              required
            />
          </FormColumn>
          <FormColumn size="medium">
            <label htmlFor="password" className="m-password-form__tip">
              {__('password.form.current_password.tip')}
            </label>
          </FormColumn>
        </FormRow>
        <FormRow className="m-password-form__row">
          <FormColumn size="medium">
            <TextFieldGroup
              name="newPassword"
              type="password"
              onChange={this.handleNewPasswordChange}
              label={__('password.form.new_password.label')}
              placeholder={__('password.form.new_password.placeholder')}
              required
            />
          </FormColumn>
          <FormColumn size="medium">
            <label htmlFor="newPassword" className="m-password-form__tip">
              {__('password.form.new_password.tip')}
            </label>
          </FormColumn>
          {this.state.passwordStrength.length !== 0 && (
            <FormColumn size="medium" bottomSpace className="m-password-form__strength">
              <PasswordStrength strength={this.state.passwordStrength} />
            </FormColumn>
          )}
        </FormRow>
        <FormRow className="m-password-form__row">
          <FormColumn size="medium">
            <TextFieldGroup
              name="confirmNewPassword"
              type="password"
              onChange={this.handleConfirmPasswordChange}
              errors={this.state.passwordError}
              label={__('password.form.new_password_confirmation.label')}
              placeholder={__('password.form.new_password_confirmation.placeholder')}
              required
            />
          </FormColumn>
        </FormRow>
        {/*
          <FormRow className="m-password-form__row">
          <FormColumn size="medium">
            <Field
              name="tfa"
              component={TextFieldGroup}
              onChange={this.handleInputChange}
              label={__('password.form.tfa.label')}
              placeholder={__('password.form.tfa.placeholder')}
              disabled
            />
          </FormColumn>
          <FormColumn size="medium">
            <label htmlFor="newPassword" className="m-password-form__tip">
              {__('password.form.tfa.tip')}
            </label>
          </FormColumn>
        </FormRow>
        */}
        <FormRow>
          <FormColumn size="medium" className="m-password-form__action" bottomSpace>
            <Button shape="plain" display="expanded" onClick={this.handleSubmit} {...submitButtonProps}>
              {__('password.form.action.validate')}
            </Button>
          </FormColumn>
          <FormColumn size="shrink" className="m-password-form__action">
            <Button shape="hollow" display="expanded" onClick={onCancel}>
              {__('password.form.action.cancel')}
            </Button>
          </FormColumn>
        </FormRow>
      </FormGrid>
    );
  }
}

export default PasswordForm;
