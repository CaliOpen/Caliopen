import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Fieldset, Legend, FormGrid, FormRow, FormColumn, FieldErrors, TextFieldGroup } from '../../../../components/form';
import Section from '../../../../components/Section';
import Button from '../../../../components/Button';
import Icon from '../../../../components/Icon';
import Link from '../../../../components/Link';

import './style.scss';

class ForgotPasswordForm extends Component {
  static propTypes = {
    errors: PropTypes.shape({}),
    onSubmit: PropTypes.func.isRequired,
    success: PropTypes.bool,
    __: PropTypes.func.isRequired,
  };

  static defaultProps = {
    errors: {},
    success: false,
  };

  state = {
    formValues: {
      username: '',
    },
  };

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState(prevState => ({
      formValues: {
        ...prevState.formValues,
        [name]: value,
      },
    }));
  }

  handleSubmit = (ev) => {
    ev.preventDefault();
    const { formValues } = this.state;
    this.props.onSubmit({ formValues });
  }

  render() {
    const { __, errors, success } = this.props;

    return (
      <Section title={__('password.forgot-form.title')} className="m-forgot-password-form">
        <FormGrid className="m-forgot-password-form">
          <form method="post" onSubmit={this.handleSubmit}>
            <Fieldset>
              {errors.global && (
                <FormRow>
                  <FormColumn rightSpace={false} bottomSpace>
                    <FieldErrors errors={errors.global} />
                  </FormColumn>
                </FormRow>
              )}
              {success ? (
                <FormRow>
                  <FormColumn rightSpace={false} bottomSpace className="m-forgot-password-form__success">
                    <Icon type="check" rightSpaced />{__('password.forgot-form.success')}
                  </FormColumn>
                  <FormColumn rightSpace={false} className="m-forgot-password-form__action" bottomSpace>
                    <Link
                      button
                      plain
                      expanded
                      to="/auth/signin"
                    >{__('password.forgot-form.action.login')}</Link>
                  </FormColumn>
                </FormRow>
              ) : (
                <FormRow>
                  <FormColumn rightSpace={false} bottomSpace>
                    <Legend>
                      {__('password.forgot-form.instructions')}
                    </Legend>
                  </FormColumn>
                  <FormColumn rightSpace={false} bottomSpace>
                    <TextFieldGroup
                      label={__('password.forgot-form.username.label')}
                      placeholder={__('password.forgot-form.username.placeholder')}
                      name="username"
                      value={this.state.formValues.username}
                      errors={errors.username}
                      onChange={this.handleInputChange}
                      showLabelforSr
                    />
                  </FormColumn>
                  <FormColumn rightSpace={false} bottomSpace>
                    <TextFieldGroup
                      label={__('password.forgot-form.recovery_email.label')}
                      placeholder={__('password.forgot-form.recovery_email.placeholder')}
                      name="recovery_email"
                      value={this.state.formValues.recovery_email}
                      errors={errors.recovery_email}
                      onChange={this.handleInputChange}
                      showLabelforSr
                    />
                  </FormColumn>
                  <FormColumn rightSpace={false} className="m-forgot-password-form__action" bottomSpace>
                    <Button
                      type="submit"
                      display="expanded"
                      shape="plain"
                    >{__('password.forgot-form.action.send')}</Button>
                  </FormColumn>
                  <FormColumn rightSpace={false}>
                    <Link to="/auth/signin">{__('password.forgot-form.cancel')}</Link>
                  </FormColumn>
                </FormRow>
              )}
            </Fieldset>
          </form>
        </FormGrid>
      </Section>
    );
  }
}

export default ForgotPasswordForm;
