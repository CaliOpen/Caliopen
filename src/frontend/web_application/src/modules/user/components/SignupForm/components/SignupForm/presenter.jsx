import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import {
  Spinner,
  Link,
  Label,
  Subtitle,
  PasswordStrength,
  FieldErrors,
  TextBlock,
  Modal,
  Button,
  TextFieldGroup,
  CheckboxFieldGroup,
  FormGrid,
  FormRow,
  FormColumn,
} from '../../../../../../components';
import { getConfig } from '../../../../../../services/config';

import './style.scss';

function generateStateFromProps(props) {
  return {
    ...props.formValues,
  };
}

const noop = () => {
  // noop
};

class SignupForm extends Component {
  static propTypes = {
    errors: PropTypes.shape({}),
    form: PropTypes.shape({}),
    onSubmit: PropTypes.func.isRequired,
    onFieldChange: PropTypes.func,
    onFieldBlur: PropTypes.func,
    isValidating: PropTypes.bool.isRequired,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  static defaultProps = {
    errors: {},
    form: {},
    onFieldChange: noop,
    onFieldBlur: noop,
  };

  state = {
    isModalOpen: false,
    formValues: {
      username: '',
      password: '',
      tos: false,
      privacy: false,
      recovery_email: '',
    },
    passwordStrength: '',
  };

  UNSAFE_componentWillMount() {
    this.setState(generateStateFromProps(this.props));
  }

  async componentDidMount() {
    import(/* webpackChunkName: "zxcvbn" */ 'zxcvbn').then(
      ({ default: zxcvbn }) => {
        this.zxcvbn = zxcvbn;
      }
    );
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    this.setState(generateStateFromProps(newProps));
  }

  handleOpenModal = () => {
    this.setState({
      isModalOpen: true,
    });
  };

  handleCloseModal = () => {
    this.setState({
      isModalOpen: false,
    });
  };

  handlePasswordChange = (event) => {
    this.handleInputChange(event);
    this.calcPasswordStrengh();
  };

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

  handleInputChange = (event) => {
    const { name, value: inputValue, type, checked } = event.target;
    const value = type === 'checkbox' ? checked : inputValue;
    const { onFieldChange } = this.props;

    this.setState(
      (prevState) => ({
        formValues: {
          ...prevState.formValues,
          [name]: value,
        },
      }),
      () => {
        onFieldChange(name, value);
      }
    );
  };

  handleInputBlur = (event) => {
    const { name, value } = event.target;
    const { onFieldBlur } = this.props;

    onFieldBlur(name, value);
  };

  handleSubmit = (ev) => {
    ev.preventDefault();
    const { formValues } = this.state;
    this.props.onSubmit({ formValues });
  };

  renderModal = () => {
    const { i18n } = this.props;

    return (
      <Modal
        className="s-signup__modal"
        isOpen={this.state.isModalOpen}
        contentLabel={i18n._(/* i18n */ 'signup.privacy.modal.label', null, {
          message: 'About Piwik',
        })}
        title={i18n._(/* i18n */ 'signup.privacy.modal.label', null, {
          message: 'About Piwik',
        })}
        onClose={this.handleCloseModal}
      >
        <p>
          <Trans
            id="signup.privacy.modal.title"
            message="Caliopen is under development !"
          />
        </p>
        <p>
          <Trans id="signup.privacy.modal.text.alpha_tester">
            As an alpha-tester your contribution is precious and will allow us
            to finalize Caliopen.
          </Trans>
        </p>
        <p>
          <Trans id="signup.privacy.modal.text.get_data">
            For this purpose, you grant us the right to collect data related to
            your usage (displayed pages, timings, clics, scrolls ...almost
            everything that can be collected!).
          </Trans>
        </p>
        <p>
          <Trans id="signup.privacy.modal.text.desactivate_dnt">
            You need to deactivate the DoNotTrack setting from your browser
            preferences (more informations at http://donottrack.us), as well as
            allowing cookies.
          </Trans>
        </p>
        <p>
          <Trans id="signup.privacy.modal.text.piwik">
            We use https://piwik.org/ the open-source analytics plateform. The
            collected data will not be disclosed to any third party, and will
            stay scoped to Caliopen&apos;s alpha testing purpose.
          </Trans>
        </p>
        <Button shape="plain" onClick={this.handleCloseModal}>
          <Trans id="signup.privacy.modal.close" message="Ok got it !" />
        </Button>
      </Modal>
    );
  };

  render() {
    const { form, errors = {}, i18n, isValidating } = this.props;
    const { hostname } = getConfig();

    return (
      <div className="s-signup">
        <FormGrid className="s-signup__form">
          <form method="post" name="ac_form" {...form}>
            {errors.global && errors.global.length !== 0 && (
              <FormRow>
                <FormColumn rightSpace={false} bottomSpace>
                  <FieldErrors
                    className="s-signup__global-errors"
                    errors={errors.global}
                  />
                </FormColumn>
              </FormRow>
            )}
            <FormRow>
              <FormColumn rightSpace={false} bottomSpace>
                <TextFieldGroup
                  id="signup_username"
                  inputProps={{
                    name: 'username',
                    placeholder: i18n._(
                      /* i18n */ 'signup.form.username.placeholder',
                      null,
                      { message: 'username' }
                    ),
                    value: this.state.formValues.username,
                    onChange: this.handleInputChange,
                    onBlur: this.handleInputBlur,
                    expanded: true,
                  }}
                  label={i18n._(/* i18n */ 'signup.form.username.label', null, {
                    message: 'Username',
                  })}
                  errors={errors.username}
                />
                <TextBlock className="s-signup__user">
                  <span className="s-signup__username">
                    {this.state.formValues.username}
                  </span>
                  @{hostname}
                </TextBlock>
              </FormColumn>
            </FormRow>
            <FormRow>
              <FormColumn rightSpace={false} bottomSpace>
                <TextFieldGroup
                  id="signup_password"
                  inputProps={{
                    name: 'password',
                    placeholder: i18n._(
                      /* i18n */ 'signup.form.password.placeholder',
                      null,
                      { message: 'password' }
                    ),
                    type: 'password',
                    value: this.state.formValues.password,
                    onChange: this.handlePasswordChange,
                    onBlur: this.handleInputBlur,
                    expanded: true,
                  }}
                  label={i18n._(/* i18n */ 'signup.form.password.label', null, {
                    message: 'Password',
                  })}
                  errors={errors.password}
                />
              </FormColumn>
              {this.state.passwordStrength.length !== 0 && (
                <FormColumn rightSpace={false} bottomSpace>
                  <PasswordStrength strength={this.state.passwordStrength} />
                </FormColumn>
              )}
            </FormRow>
            <FormRow>
              <FormColumn rightSpace={false} bottomSpace>
                <TextFieldGroup
                  id="signup_recovery_email"
                  inputProps={{
                    name: 'recovery_email',
                    placeholder: i18n._(
                      /* i18n */ 'signup.form.invitation_email.placeholder',
                      null,
                      { message: 'example@domain.tld' }
                    ),
                    value: this.state.formValues.recovery_email,
                    onChange: this.handleInputChange,
                    onBlur: this.handleInputBlur,
                    theme: 'contrasted',
                    expanded: true,
                  }}
                  // Alpha: label "recovery email" replaced by "invitation email"
                  // label={
                  // i18n._(/* i18n */ 'signup.form.recovery_email.label',
                  //  null, { message: 'Backup email address' })
                  // }
                  // placeholder={i18n._(/* i18n */ 'signup.form.recovery_email.placeholder', null, { message: '' })}
                  label={i18n._(
                    /* i18n */ 'signup.form.invitation_email.label',
                    null,
                    {
                      message: 'Invitation email:',
                    }
                  )}
                  errors={errors.recovery_email}
                />
                <Label
                  htmlFor="signup_recovery_email"
                  className="s-signup__recovery-label"
                >
                  <Trans id="signup.form.invitation_email.tip">
                    Please fill with the email provided when you requested an
                    invitation.
                  </Trans>
                </Label>
              </FormColumn>
            </FormRow>
            {/* Alpha: hide TOS checkbox
              <FormRow>
                <FormColumn rightSpace={false} bottomSpace>
                  <CheckboxFieldGroup
                    id="signup_tos"
                    className="s-signup__tos-checkbox"
              label={i18n._(/* i18n  'signup.form.tos.label',
                null, { message: 'I agree Terms and conditions' })}
                    name="tos"
                    checked={this.state.formValues.tos}
                    errors={errors.tos}
                    onChange={this.handleInputChange}
                  />
                </FormColumn>
              </FormRow>
              */}
            <FormRow>
              <FormColumn
                rightSpace={false}
                className="s-signup__privacy"
                bottomSpace
              >
                <Subtitle>
                  <Trans
                    id="signup.form.privacy.title"
                    message="Privacy policy"
                  />
                </Subtitle>
                <p className="s-signup__privacy-text">
                  <Trans id="signup.form.privacy.intro">
                    Throughout the development phase, we collect some data (but
                    no more than the NSA).
                  </Trans>{' '}
                  <Button
                    className="s-signup__privacy-link"
                    onClick={this.handleOpenModal}
                    display="inline"
                  >
                    <Trans
                      id="signup.form.privacy.more_info"
                      message="More info"
                    />
                  </Button>
                </p>
                {this.renderModal()}
                <CheckboxFieldGroup
                  id="signup_privacy"
                  className="s-signup__privacy-checkbox"
                  label={i18n._(
                    /* i18n */ 'signup.form.privacy.checkbox.label',
                    null,
                    {
                      message: 'I understand and agree',
                    }
                  )}
                  name="privacy"
                  checked={this.state.formValues.privacy}
                  errors={errors.privacy}
                  onChange={this.handleInputChange}
                />
              </FormColumn>
            </FormRow>
            <FormRow>
              <FormColumn
                rightSpace={false}
                className="s-signup__action"
                bottomSpace
              >
                <Button
                  type="submit"
                  onClick={this.handleSubmit}
                  display="expanded"
                  shape="plain"
                  disabled={isValidating}
                  icon={
                    isValidating ? (
                      <Spinner
                        svgTitleId="signup-spinner"
                        isLoading
                        display="inline"
                        theme="bright"
                      />
                    ) : null
                  }
                >
                  <Trans id="signup.action.create" message="Create" />
                </Button>
              </FormColumn>
            </FormRow>
            <FormRow>
              <FormColumn rightSpace={false} className="s-signup__link">
                <Link to="/auth/signin">
                  <Trans
                    id="signup.go_signin"
                    message="I already have an account"
                  />
                </Link>
              </FormColumn>
            </FormRow>
          </form>
        </FormGrid>
      </div>
    );
  }
}

export default SignupForm;
