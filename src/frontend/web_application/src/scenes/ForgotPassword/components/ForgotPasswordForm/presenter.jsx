import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import {
  Title,
  Link,
  Button,
  Icon,
  TextFieldGroup,
  FieldErrors,
  Fieldset,
  Legend,
  FormGrid,
  FormRow,
  FormColumn,
} from '../../../../components';

import './style.scss';

class ForgotPasswordForm extends Component {
  static propTypes = {
    errors: PropTypes.shape({}),
    onSubmit: PropTypes.func.isRequired,
    success: PropTypes.bool,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
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
    this.setState((prevState) => ({
      formValues: {
        ...prevState.formValues,
        [name]: value,
      },
    }));
  };

  handleSubmit = (ev) => {
    ev.preventDefault();
    const { formValues } = this.state;
    this.props.onSubmit({ formValues });
  };

  render() {
    const { i18n, errors, success } = this.props;

    return (
      <div className="m-forgot-password-form">
        <Title>
          <Trans id="password.forgot-form.title">Forgot password</Trans>
        </Title>
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
                  <FormColumn
                    rightSpace={false}
                    bottomSpace
                    className="m-forgot-password-form__success"
                  >
                    <Icon type="check" rightSpaced />
                    <Trans id="password.forgot-form.success">
                      Done! You will receive an email shortly with instructions
                      to reset your password.
                    </Trans>
                  </FormColumn>
                  <FormColumn
                    rightSpace={false}
                    className="m-forgot-password-form__action"
                    bottomSpace
                  >
                    <Link button plain expanded to="/auth/signin">
                      <Trans id="password.forgot-form.action.login">Ok</Trans>
                    </Link>
                  </FormColumn>
                </FormRow>
              ) : (
                <FormRow>
                  <FormColumn rightSpace={false} bottomSpace>
                    <Legend>
                      <Trans id="password.forgot-form.instructions">
                        Enter your username and we&apos;ll email instructions on
                        how to reset your password.
                      </Trans>
                    </Legend>
                  </FormColumn>
                  <FormColumn rightSpace={false} bottomSpace>
                    <TextFieldGroup
                      theme="contrasted"
                      label={i18n._(
                        'password.forgot-form.username.label',
                        null,
                        { defaults: 'Username' }
                      )}
                      placeholder={i18n._(
                        'password.forgot-form.username.placeholder',
                        null,
                        { defaults: 'Username' }
                      )}
                      name="username"
                      value={this.state.formValues.username}
                      errors={errors.username}
                      onChange={this.handleInputChange}
                    />
                  </FormColumn>
                  <FormColumn rightSpace={false} bottomSpace>
                    <TextFieldGroup
                      theme="contrasted"
                      label={i18n._(
                        'password.forgot-form.recovery_email.label',
                        null,
                        { defaults: 'Recovery email' }
                      )}
                      placeholder={i18n._(
                        'password.forgot-form.recovery_email.placeholder',
                        null,
                        { defaults: 'Recovery email' }
                      )}
                      name="recovery_email"
                      value={this.state.formValues.recovery_email}
                      errors={errors.recovery_email}
                      onChange={this.handleInputChange}
                    />
                  </FormColumn>
                  <FormColumn
                    rightSpace={false}
                    className="m-forgot-password-form__action"
                    bottomSpace
                  >
                    <Button type="submit" display="expanded" shape="plain">
                      <Trans id="password.forgot-form.action.send">Send</Trans>
                    </Button>
                  </FormColumn>
                  <FormColumn
                    rightSpace={false}
                    className="m-forgot-password-form__link"
                  >
                    <Link to="/auth/signin">
                      <Trans id="password.forgot-form.cancel">Cancel</Trans>
                    </Link>
                  </FormColumn>
                </FormRow>
              )}
            </Fieldset>
          </form>
        </FormGrid>
      </div>
    );
  }
}

export default ForgotPasswordForm;
