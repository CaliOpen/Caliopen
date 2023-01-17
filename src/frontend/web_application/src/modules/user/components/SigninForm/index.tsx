import * as React from 'react';
import { Trans, useLingui } from '@lingui/react';
import { Redirect, useLocation } from 'react-router-dom';
import {
  Link,
  Spinner,
  FieldErrors,
  TextFieldGroup,
  Button,
  FormGrid,
  FormRow,
  FormColumn,
} from 'src/components';
import getClient from 'src/services/api-client';
import { useDevice } from 'src/modules/device/hooks/useDevice';
import { usernameNormalizer } from '../../services/usernameNormalizer';
import { STATUS_VERIFIED } from '../../../device';
import './style.scss';

const CONTEXT_SAFE = 'safe';
// const CONTEXT_PUBLIC = 'public';
// const CONTEXT_UNSECURE = 'unsecure';

const URL_DEVICES = '/settings/new-device';

const getRedirect = (queryString: string) => {
  const paramRedirect = queryString
    .split(/[?|&]/)
    .find((str) => /^redirect/.test(str));

  return paramRedirect ? paramRedirect.split('=')[1] : undefined;
};

interface Errors {
  [key: string]: React.ReactNode[];
}

const defaultIdentifier = { username: '', password: '' };
function SigninForm() {
  const { search } = useLocation();
  const { i18n } = useLingui();
  const { clientDevice } = useDevice();
  const usernameInput = React.useRef<HTMLInputElement>(null);
  const passwordInput = React.useRef<HTMLInputElement>(null);

  const [context] = React.useState(CONTEXT_SAFE);
  const [identifier, setIdentifier] = React.useState(defaultIdentifier);

  const [errors, setErrors] = React.useState<Errors>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [shouldRedirectDevice, setShouldRedirectDevice] = React.useState(false);

  React.useEffect(() => {
    // On mount we want to retrieve form values from browser password manager
    const username = usernameInput.current?.value || '';
    const password = passwordInput.current?.value || '';

    if (username || password) {
      setIdentifier({ username, password });
    }
  }, []);

  const validate = (values: { username: string; password: string }) => {
    const errs: Errors = {};

    if (values.username.length === 0) {
      errs.username = [
        <Trans
          id="signin.feedback.required_username"
          message="A username is required"
        />,
      ];
    }

    if (values.password.length === 0) {
      errs.password = [
        <Trans
          id="signin.feedback.required_password"
          message="A password is required"
        />,
      ];
    }

    return errs;
  };

  React.useEffect(() => {
    setErrors(validate(identifier));
  }, [identifier]);

  const handleSignin = async (ev: React.SyntheticEvent) => {
    ev.preventDefault();
    if (errors.length) {
      return;
    }
    setIsLoading(true);

    try {
      const response = await getClient().post('/auth/signin', {
        context,
        password: identifier.password,
        username: usernameNormalizer(identifier.username),
        device: clientDevice,
      });
      if (response.data.device.status !== STATUS_VERIFIED) {
        setShouldRedirectDevice(true);
      }
      setIsLoading(false);
      setIsAuthenticated(true);
    } catch (err) {
      setIsLoading(false);
      const isExpectedError =
        err.response &&
        err.response.status >= 400 &&
        err.response.status < 500 &&
        err.response.data.errors;

      if (isExpectedError) {
        setErrors({
          global: [
            <Trans
              id="signin.feedback.invalid"
              message="Credentials are invalid"
            />,
          ],
        });
      } else {
        throw err;
      }
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setIdentifier((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const redirect = getRedirect(search) || '/';

  if (
    isAuthenticated &&
    shouldRedirectDevice &&
    !redirect.includes('/validate-device/')
  ) {
    return <Redirect push to={URL_DEVICES} />;
  }

  if (isAuthenticated) {
    return <Redirect push to={redirect} />;
  }

  const isValid = Object.keys(errors).length === 0;

  return (
    <div className="s-signin">
      <FormGrid className="s-signin__form">
        <form method="post" onSubmit={handleSignin}>
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
                id="signin_username"
                inputProps={{
                  placeholder: i18n._(
                    /* i18n */ 'signin.form.username.placeholder',
                    undefined,
                    { message: 'username' }
                  ),
                  name: 'username',
                  value: identifier.username,
                  onChange: handleInputChange,
                  expanded: true,
                }}
                label={i18n._(
                  /* i18n */ 'signin.form.username.label',
                  undefined,
                  {
                    message: 'Username',
                  }
                )}
                errors={errors.username}
                ref={usernameInput}
              />
            </FormColumn>
            <FormColumn rightSpace={false} bottomSpace>
              <TextFieldGroup
                id="signin_password"
                label={i18n._(
                  /* i18n */ 'signin.form.password.label',
                  undefined,
                  {
                    message: 'Password',
                  }
                )}
                inputProps={{
                  placeholder: i18n._(
                    /* i18n */ 'signin.form.password.placeholder',
                    undefined,
                    { message: 'password' }
                  ),
                  name: 'password',
                  type: 'password',
                  value: identifier.password,
                  onChange: handleInputChange,
                  expanded: true,
                }}
                errors={errors.password}
                ref={passwordInput}
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
                disabled={!isValid || isLoading}
                icon={
                  isLoading ? (
                    <Spinner
                      svgTitleId="signin-spinner"
                      isLoading
                      display="inline"
                      theme="bright"
                    />
                  ) : undefined
                }
              >
                <Trans id="signin.action.login" message="Login" />
              </Button>
            </FormColumn>
          </FormRow>
          <FormRow>
            <FormColumn rightSpace={false} className="s-signin__link">
              <Link to="/auth/forgot-password">
                <Trans
                  id="signin.action.forgot_password"
                  message="Forgot password?"
                />
              </Link>
            </FormColumn>
            <FormColumn rightSpace={false} className="s-signin__link">
              <Link to="/auth/signup">
                <Trans
                  id="signin.create_an_account"
                  message="Create an account"
                />
              </Link>
            </FormColumn>
          </FormRow>
        </form>
      </FormGrid>
    </div>
  );
}

export default SigninForm;
