import * as React from 'react';
import { Trans, useLingui } from '@lingui/react';
import { Link, useHistory } from 'react-router-dom';
import type ZxcvbnFunc from 'zxcvbn';
import {
  Button,
  CheckboxFieldGroup,
  FieldErrors,
  FormColumn,
  FormGrid,
  FormRow,
  Label,
  PasswordStrength,
  Spinner,
  Subtitle,
  TextBlock,
  TextFieldGroup,
} from 'src/components';
import { useSettings } from 'src/modules/settings';
import { getConfig } from 'src/services/config';

import { useDevice } from '../../../device';

import { signup } from '../../services/signup';
import {
  validate,
  getLocalizedErrors,
  ERR_UNABLE_TO_SIGNUP,
} from './form-validator';
import PiwikModal from './components/PiwikModal';
import './style.scss';

export const USER_IDENTITIES_ROUTE = '/user/identities';

function Signup() {
  const { i18n } = useLingui();
  // totally useless: settings aren't fetch until authenticated
  const settings = useSettings();
  const { push } = useHistory();
  const { clientDevice } = useDevice();

  const [fieldErrors, setFieldErrors] = React.useState<{
    global?: string[];
    username?: string[];
    password?: string[];
    tos?: string[];
    privacy?: string[];
    recovery_email?: string[];
  }>({});
  const [isValidating, setIsValidating] = React.useState(false);

  const resetErrorsState = (fieldname) => {
    setFieldErrors((prevState) => ({
      ...prevState,
      [fieldname]: [],
    }));
  };

  const onUsernameChanged = (username) => {
    if (username.length === 0) {
      resetErrorsState('username');
    }

    if (username.length >= 3) {
      resetErrorsState('username');
      validate({ username }, i18n, 'username').catch((errors) => {
        setFieldErrors((prev) => ({ ...prev, ...errors }));
      });
    }
  };

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [passwordStrength, setPasswordStrength] = React.useState<void | number>(
    undefined
  );
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [tos, setTos] = React.useState(false);
  const [privacy, setPrivacy] = React.useState(false);
  const [recovery_email, setRecoveryEmail] = React.useState('');

  const zxcvbn = React.useRef<typeof ZxcvbnFunc>();

  React.useEffect(() => {
    import(/* webpackChunkName: "zxcvbn" */ 'zxcvbn').then(
      ({ default: loaded }) => {
        zxcvbn.current = loaded;
      }
    );
  }, []);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const calcPasswordStrength = (value: string) => {
    if (!value.length || !zxcvbn.current) {
      setPasswordStrength(undefined);

      return;
    }

    const { score } = zxcvbn.current(value);
    setPasswordStrength(score);
  };

  const handleInputChange = (event) => {
    const { name, value: inputValue, type, checked } = event.target;
    const value = type === 'checkbox' ? checked : inputValue;
    switch (name) {
      case 'username':
        setUsername(value);
        onUsernameChanged(value);
        break;
      case 'password':
        setPassword(value);
        calcPasswordStrength(value);
        break;
      case 'tos':
        setTos(value);
        break;
      case 'privacy':
        setPrivacy(value);
        break;
      case 'recovery_email':
        setRecoveryEmail(value);
        break;
      default:
        break;
    }
  };

  const handleInputBlur = async (event) => {
    const { name, value } = event.target;

    if (name !== 'username') {
      return;
    }

    if (value.length === 0) {
      resetErrorsState('username');

      return;
    }

    try {
      await validate({ username: value }, i18n, 'usernameAvailability');
    } catch (errors) {
      setFieldErrors((prev) => ({ ...prev, ...errors }));
    }
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const formValues = {
      username,
      password,
      tos,
      privacy,
      recovery_email,
    };

    try {
      setIsValidating(true);
      await validate(formValues, i18n, 'full');
    } catch (errors) {
      setFieldErrors(errors);
      setIsValidating(false);

      return undefined;
    }

    try {
      await signup({
        ...formValues,
        device: clientDevice,
        settings,
      });

      return push(USER_IDENTITIES_ROUTE);
    } catch (err) {
      const localizedErrors = getLocalizedErrors(i18n);

      setFieldErrors((prev) => ({
        ...prev,
        global: [localizedErrors[ERR_UNABLE_TO_SIGNUP]],
      }));
      setIsValidating(false);

      return undefined;
    }
  };

  const { hostname } = getConfig() || {};

  return (
    <div className="s-signup">
      <FormGrid className="s-signup__form">
        <form method="post" name="ac_form" onSubmit={handleSubmit}>
          {fieldErrors.global && fieldErrors.global.length !== 0 && (
            <FormRow>
              <FormColumn rightSpace={false} bottomSpace>
                <FieldErrors
                  className="s-signup__global-errors"
                  errors={fieldErrors.global}
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
                    undefined,
                    { message: 'username' }
                  ),
                  value: username,
                  onChange: handleInputChange,
                  onBlur: handleInputBlur,
                  expanded: true,
                }}
                label={i18n._(
                  /* i18n */ 'signup.form.username.label',
                  undefined,
                  {
                    message: 'Username',
                  }
                )}
                errors={fieldErrors.username}
              />
              <TextBlock className="s-signup__user">
                <span className="s-signup__username">{username}</span>@
                {hostname}
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
                    undefined,
                    { message: 'password' }
                  ),
                  type: 'password',
                  value: password,
                  onChange: handleInputChange,
                  onBlur: handleInputBlur,
                  expanded: true,
                }}
                label={i18n._(
                  /* i18n */ 'signup.form.password.label',
                  undefined,
                  {
                    message: 'Password',
                  }
                )}
                errors={fieldErrors.password}
              />
            </FormColumn>
            {passwordStrength !== undefined && (
              <FormColumn rightSpace={false} bottomSpace>
                <PasswordStrength strength={passwordStrength} />
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
                    undefined,
                    { message: 'example@domain.tld' }
                  ),
                  value: recovery_email,
                  onChange: handleInputChange,
                  onBlur: handleInputBlur,
                  theme: 'contrasted',
                  expanded: true,
                }}
                // Alpha: label "recovery email" replaced by "invitation email"
                // label={
                // i18n._(/* i18n */ 'signup.form.recovery_email.label',
                //  undefined, { message: 'Backup email address' })
                // }
                // placeholder={i18n._(/* i18n */ 'signup.form.recovery_email.placeholder', null, { message: '' })}
                label={i18n._(
                  /* i18n */ 'signup.form.invitation_email.label',
                  undefined,
                  {
                    message: 'Invitation email:',
                  }
                )}
                errors={fieldErrors.recovery_email}
              />
              <Label
                htmlFor="signup_recovery_email"
                className="s-signup__recovery-label"
              >
                <Trans
                  id="signup.form.invitation_email.tip"
                  message="Please fill with the email provided when you requested an invitation."
                />
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
                <Trans
                  id="signup.form.privacy.intro"
                  message="Throughout the development phase, we collect some data (but no more than the NSA)."
                />{' '}
                <Button
                  className="s-signup__privacy-link"
                  onClick={handleOpenModal}
                  display="inline"
                >
                  <Trans
                    id="signup.form.privacy.more_info"
                    message="More info"
                  />
                </Button>
              </p>
              <PiwikModal
                handleCloseModal={handleCloseModal}
                isModalOpen={isModalOpen}
              />
              <CheckboxFieldGroup
                id="signup_privacy"
                className="s-signup__privacy-checkbox"
                label={i18n._(
                  /* i18n */ 'signup.form.privacy.checkbox.label',
                  undefined,
                  {
                    message: 'I understand and agree',
                  }
                )}
                name="privacy"
                checked={privacy}
                errors={fieldErrors.privacy}
                onChange={handleInputChange}
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
                  ) : undefined
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

export default Signup;
