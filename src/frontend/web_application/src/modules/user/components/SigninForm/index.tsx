import * as React from 'react';
import { Trans, withI18n, withI18nProps } from '@lingui/react';
import { compose } from 'redux';
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
import { usernameNormalizer } from '../../services/usernameNormalizer';
import { withDevice, STATUS_VERIFIED } from '../../../device';
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

interface SigninProps extends withI18nProps {
  // TODO: move to hook
  clientDevice?: any;
}

const defaultIdentifier = { username: '', password: '' };
function SigninForm({ clientDevice, i18n }: SigninProps) {
  const { search } = useLocation();
  const usernameInput = React.useRef<HTMLInputElement>();
  const passwordInput = React.useRef<HTMLInputElement>();

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
        <Trans id="signin.feedback.required_username">
          A username is required
        </Trans>,
      ];
    }

    if (values.password.length === 0) {
      errs.password = [
        <Trans id="signin.feedback.required_password">
          A password is required
        </Trans>,
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
            <Trans id="signin.feedback.invalid">Credentials are invalid</Trans>,
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
            // @ts-ignore
            <FormRow>
              {/* @ts-ignore */}
              <FormColumn rightSpace={false} bottomSpace>
                <FieldErrors errors={errors.global} />
              </FormColumn>
            </FormRow>
          )}
          {/* @ts-ignore */}
          <FormRow>
            {/* @ts-ignore */}
            <FormColumn rightSpace={false} bottomSpace>
              <TextFieldGroup
                id="signin_username"
                theme="contrasted"
                label={i18n._('signin.form.username.label', undefined, {
                  defaults: 'Username',
                })}
                placeholder={i18n._(
                  'signin.form.username.placeholder',
                  undefined,
                  { defaults: 'username' }
                )}
                name="username"
                value={identifier.username}
                errors={errors.username}
                onChange={handleInputChange}
                innerRef={usernameInput}
              />
            </FormColumn>
            {/* @ts-ignore */}
            <FormColumn rightSpace={false} bottomSpace>
              <TextFieldGroup
                id="signin_password"
                theme="contrasted"
                label={i18n._('signin.form.password.label', undefined, {
                  defaults: 'Password',
                })}
                placeholder={i18n._(
                  'signin.form.password.placeholder',
                  undefined,
                  { defaults: 'password' }
                )}
                name="password"
                type="password"
                value={identifier.password}
                errors={errors.password}
                onChange={handleInputChange}
                innerRef={passwordInput}
              />
            </FormColumn>
          </FormRow>
          {/* @ts-ignore */}
          <FormRow>
            {/* @ts-ignore */}
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
                <Trans id="signin.action.login">Login</Trans>
              </Button>
            </FormColumn>
          </FormRow>
          {/* @ts-ignore */}
          <FormRow>
            {/* @ts-ignore */}
            <FormColumn rightSpace={false} className="s-signin__link">
              <Link to="/auth/forgot-password">
                <Trans id="signin.action.forgot_password">
                  Forgot password?
                </Trans>
              </Link>
            </FormColumn>
            {/* @ts-ignore */}
            <FormColumn rightSpace={false} className="s-signin__link">
              <Link to="/auth/signup">
                <Trans id="signin.create_an_account">Create an account</Trans>
              </Link>
            </FormColumn>
          </FormRow>
        </form>
      </FormGrid>
    </div>
  );
}

export default compose(withI18n(), withDevice())(SigninForm);
