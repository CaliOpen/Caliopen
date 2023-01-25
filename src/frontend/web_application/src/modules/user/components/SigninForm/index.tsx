import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Trans, useLingui } from '@lingui/react';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { Redirect, useLocation } from 'react-router-dom';
import {
  Link,
  FormGrid,
  FormRow,
  FormColumn,
  FormikTextFieldGroup,
} from 'src/components';
import getClient from 'src/services/api-client';
import { useDevice } from 'src/modules/device/hooks/useDevice';
import { validateRequired } from 'src/modules/form/services/validators';
import { notifyError } from 'src/modules/userNotify';
import { usernameNormalizer } from '../../services/usernameNormalizer';
import { STATUS_VERIFIED } from '../../../device';
import './style.scss';
import SubmitButton from './components/SubmitButton';

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

interface SigninFormValues {
  username: string;
  password: string;
}

const defaultIdentifier = { username: '', password: '' };
function SigninForm() {
  const { search } = useLocation();
  const { i18n } = useLingui();
  const dispatch = useDispatch();
  const { clientDevice } = useDevice();
  const [context] = React.useState(CONTEXT_SAFE);

  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [shouldRedirectDevice, setShouldRedirectDevice] = React.useState(false);

  const handleSignin = async (
    { username, password }: SigninFormValues,
    { setFieldError }: FormikHelpers<SigninFormValues>
  ) => {
    try {
      const response = await getClient().post('/auth/signin', {
        context,
        password,
        username: usernameNormalizer(username),
        device: clientDevice,
      });
      if (response.data.device.status !== STATUS_VERIFIED) {
        setShouldRedirectDevice(true);
      }
      setIsAuthenticated(true);
    } catch (err) {
      const isExpectedError =
        err.response &&
        err.response.status >= 400 &&
        err.response.status < 500 &&
        err.response.data.errors;

      if (isExpectedError) {
        setFieldError(
          'password',
          i18n._('signin.feedback.invalid', undefined, {
            message: 'Credentials are invalid',
          })
        );
      } else {
        dispatch(
          notifyError({
            message: i18n._(
              /* i18n */ 'general.feedback.unexpected-error',
              undefined,
              { message: 'Unexpected error occured' }
            ),
          })
        );
      }
    }
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

  return (
    <div className="s-signin">
      <FormGrid className="s-signin__form">
        <Formik<SigninFormValues>
          initialValues={defaultIdentifier}
          onSubmit={handleSignin}
        >
          <Form method="post">
            <FormRow>
              <FormColumn rightSpace={false} bottomSpace>
                <Field
                  id="signin_username"
                  name="username"
                  component={FormikTextFieldGroup}
                  validate={validateRequired(i18n)}
                  inputProps={{
                    placeholder: i18n._(
                      'signin.form.username.placeholder',
                      undefined,
                      { message: 'username' }
                    ),
                    expanded: true,
                  }}
                  label={i18n._('signin.form.username.label', undefined, {
                    message: 'Username',
                  })}
                />
              </FormColumn>
              <FormColumn rightSpace={false} bottomSpace>
                <Field
                  id="signin_password"
                  name="password"
                  component={FormikTextFieldGroup}
                  validate={validateRequired(i18n)}
                  label={i18n._('signin.form.password.label', undefined, {
                    message: 'Password',
                  })}
                  inputProps={{
                    placeholder: i18n._(
                      'signin.form.password.placeholder',
                      undefined,
                      { message: 'password' }
                    ),
                    type: 'password',
                    expanded: true,
                  }}
                />
              </FormColumn>
            </FormRow>
            <FormRow>
              <FormColumn
                rightSpace={false}
                className="s-signin__action"
                bottomSpace
              >
                <SubmitButton />
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
          </Form>
        </Formik>
      </FormGrid>
    </div>
  );
}

export default SigninForm;
