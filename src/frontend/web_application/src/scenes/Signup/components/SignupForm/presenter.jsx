import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'lingui-react';
import { Spinner, Link, Label, Subtitle, PasswordStrength, FieldErrors, TextBlock, Modal, Button, TextFieldGroup, CheckboxFieldGroup, FormGrid, FormRow, FormColumn } from '../../../../components/';
import './style.scss';

function generateStateFromProps(props) {
  return {
    ...props.formValues,
  };
}

const noop = () => {};

class SignupForm extends Component {
  static propTypes = {
    errors: PropTypes.shape({}),
    form: PropTypes.shape({}),
    onSubmit: PropTypes.func.isRequired,
    onFieldChange: PropTypes.func,
    onFieldBlur: PropTypes.func,
    isValidating: PropTypes.bool.isRequired,
    i18n: PropTypes.shape({}).isRequired,
  };

  static defaultProps = {
    errors: {},
    form: {},
    onFieldChange: noop,
    onFieldBlur: noop,
  }

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

  componentWillMount() {
    this.setState(generateStateFromProps(this.props));
  }

  async componentDidMount() {
    import(/* webpackChunkName: "zxcvbn" */ 'zxcvbn').then(({ default: zxcvbn }) => {
      this.zxcvbn = zxcvbn;
    });
  }

  componentWillReceiveProps(newProps) {
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

  handleInputChange = (event) => {
    const {
      name, value: inputValue, type, checked,
    } = event.target;
    const value = type === 'checkbox' ? checked : inputValue;
    const { onFieldChange } = this.props;

    this.setState(prevState => ({
      formValues: {
        ...prevState.formValues,
        [name]: value,
      },
    }), () => {
      onFieldChange(name, value);
    });
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
        contentLabel={i18n._('signup.privacy.modal.label', { defaults: 'About Piwik' })}
        title={i18n._('signup.privacy.modal.label', { defaults: 'About Piwik' })}
        onClose={this.handleCloseModal}
      >
        <p>
          <Trans id="signup.privacy.modal.title">
            Caliopen is under development !
          </Trans>
        </p>
        <p>
          <Trans id="signup.privacy.modal.text.alpha_tester">
            As an alpha-tester your contribution is precious and will allow us to finalize Caliopen.
          </Trans>
        </p>
        <p>
          <Trans id="signup.privacy.modal.text.get_data">
            For this purpose, you grant us the right to collect data related to your usage
            (displayed pages, timings, clics, scrolls ...almost everything that can be collected!).
          </Trans>
        </p>
        <p>
          <Trans id="signup.privacy.modal.text.desactivate_dnt">
            You need to deactivate the DoNotTrack setting from your browser preferences (more
            informations at http://donottrack.us), as well as allowing cookies.
          </Trans>
        </p>
        <p>
          <Trans id="signup.privacy.modal.text.piwik">
            We use https://piwik.org/ the open-source analytics plateform. The collected data will not
            be disclosed to any third party, and will stay scoped to Caliopen&apos;s alpha testing
            purpose.
          </Trans>
        </p>
        <Button
          shape="plain"
          onClick={this.handleCloseModal}
        >
          <Trans id="signup.privacy.modal.close">Ok got it !</Trans>
        </Button>
      </Modal>
    );
  }

  render() {
    const {
      form, errors = {}, i18n, isValidating,
    } = this.props;

    return (
      <div className="s-signup">
        <FormGrid className="s-signup__form">
          <form method="post" name="ac_form" {...form}>
            {errors.global && errors.global.length !== 0 && (
            <FormRow>
              <FormColumn rightSpace={false} bottomSpace>
                <FieldErrors className="s-signup__global-errors" errors={errors.global} />
              </FormColumn>
            </FormRow>
            )}
            <FormRow>
              <FormColumn rightSpace={false} bottomSpace >
                <TextFieldGroup
                  id="signup_username"
                  name="username"
                  theme="contrasted"
                  label={i18n._('signup.form.username.label', { defaults: 'Username' })}
                  placeholder={i18n._('signup.form.username.placeholder', { defaults: 'username' })}
                  value={this.state.formValues.username}
                  errors={errors.username}
                  onChange={this.handleInputChange}
                  onBlur={this.handleInputBlur}
                />
                <TextBlock className="s-signup__user">
                  <span className="s-signup__username">{this.state.formValues.username}</span>@alpha.caliopen.org
                </TextBlock>
              </FormColumn>
            </FormRow>
            <FormRow>
              <FormColumn rightSpace={false} bottomSpace>
                <TextFieldGroup
                  id="signup_password"
                  theme="contrasted"
                  name="password"
                  label={i18n._('signup.form.password.label', { defaults: 'Password' })}
                  placeholder={i18n._('signup.form.password.placeholder', { defaults: 'password' })}
                  type="password"
                  value={this.state.formValues.password}
                  errors={errors.password}
                  onChange={this.handlePasswordChange}
                  onBlur={this.handleInputBlur}
                />
              </FormColumn>
              {this.state.passwordStrength.length !== 0 && (
              <FormColumn rightSpace={false} bottomSpace>
                <PasswordStrength strength={this.state.passwordStrength} />
              </FormColumn>
              )}
            </FormRow>
            <FormRow>
              <FormColumn rightSpace={false} bottomSpace >
                <TextFieldGroup
                  id="signup_recovery_email"
                  theme="contrasted"
                  name="recovery_email"
                  // Alpha: label "recovery email" replaced by "invitation email"
        // label={i18n._('signup.form.recovery_email.label', { defaults: 'Backup email address' })}
        // placeholder={i18n._('signup.form.recovery_email.placeholder', { defaults: '' })}
                  label={i18n._('signup.form.invitation_email.label', { defaults: 'Invitation email:' })}
                  placeholder={i18n._('signup.form.invitation_email.placeholder', { defaults: 'example@domain.tld' })}
                  value={this.state.formValues.recovery_email}
                  errors={errors.recovery_email}
                  onChange={this.handleInputChange}
                  onBlur={this.handleInputBlur}
                />
                <Label htmlFor="signup_recovery_email" className="s-signup__recovery-label">
                  <Trans id="signup.form.invitation_email.tip">Please fill with the email provided when you requested an invitation.</Trans>
                </Label>
              </FormColumn>
            </FormRow>
            {/* Alpha: hide TOS checkbox
              <FormRow>
                <FormColumn rightSpace={false} bottomSpace>
                  <CheckboxFieldGroup
                    id="signup_tos"
                    className="s-signup__tos-checkbox"
              label={i18n._('signup.form.tos.label', { defaults: 'I agree Terms and conditions' })}
                    name="tos"
                    checked={this.state.formValues.tos}
                    errors={errors.tos}
                    onChange={this.handleInputChange}
                  />
                </FormColumn>
              </FormRow>
              */}
            <FormRow>
              <FormColumn rightSpace={false} className="s-signup__privacy" bottomSpace>
                <Subtitle><Trans id="signup.form.privacy.title">Privacy policy</Trans></Subtitle>
                <p className="s-signup__privacy-text">
                  <Trans id="signup.form.privacy.intro">Throughout the development phase, we collect some data (but no more than the NSA).</Trans>
                  {' '}
                  <Button
                    className="s-signup__privacy-link"
                    onClick={this.handleOpenModal}
                    display="inline"
                  >
                    <Trans id="signup.form.privacy.more_info">More info</Trans>
                  </Button>
                </p>
                {this.renderModal()}
                <CheckboxFieldGroup
                  id="signup_privacy"
                  className="s-signup__privacy-checkbox"
                  label={i18n._('signup.form.privacy.checkbox.label', { defaults: 'I understand and agree' })}
                  name="privacy"
                  checked={this.state.formValues.privacy}
                  errors={errors.privacy}
                  onChange={this.handleInputChange}
                />
              </FormColumn>
            </FormRow>
            <FormRow>
              <FormColumn rightSpace={false} className="s-signup__action" bottomSpace>
                <Button
                  type="submit"
                  onClick={this.handleSubmit}
                  display="expanded"
                  shape="plain"
                  disabled={isValidating}
                  icon={isValidating ? (<Spinner isLoading display="inline" />) : null}
                >
                  <Trans id="signup.action.create">Create</Trans>
                </Button>
              </FormColumn>
            </FormRow>
            <FormRow>
              <FormColumn rightSpace={false} className="s-signup__link">
                <Link to="/auth/signin"><Trans id="signup.go_signin">I already have an account</Trans></Link>
              </FormColumn>
            </FormRow>
          </form>
        </FormGrid>
      </div>
    );
  }
}

export default SignupForm;
