import * as React from 'react';
import { Trans, withI18n, withI18nProps } from '@lingui/react';
import { useDispatch } from 'react-redux';
import { Formik, Form, FormikConfig } from 'formik';
import { compose } from 'redux';
import { notifyError, notifySuccess } from 'src/modules/userNotify';
import { updateContact } from 'src/modules/contact/store';
import { UserPayload } from 'src/modules/user/types';
import { invalidate } from 'src/modules/user/store';
import {
  Section,
  PageTitle,
  Button,
  Confirm,
  TextFieldGroup,
  Spinner,
} from '../../components';
import ProfileForm from './components/ProfileForm';
import ProfileInfo from './components/ProfileInfo';
import { signout } from '../../modules/routing';
import { deleteUser, useUser } from '../../modules/user';

import './style.scss';

type Props = withI18nProps;

const UserProfile = ({ i18n }: Props) => {
  const dispatch = useDispatch();
  const [editMode, setEditMode] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [errorDeleteAccount, setErrorDeleteAccount] = React.useState<
    undefined | React.ReactNode[]
  >();

  const { user } = useUser();

  const handleSubmit: FormikConfig<UserPayload>['onSubmit'] = async (
    values
  ) => {
    try {
      await dispatch(
        updateContact({ contact: values.contact, original: user?.contact })
      );
      dispatch(invalidate());
      setEditMode(false);
    } catch (err) {
      dispatch(
        notifyError({
          message: i18n._(
            /* i18n */ 'contact.feedback.unable_to_save',
            undefined,
            {
              message: 'Unable to save the contact',
            }
          ),
        })
      );
    }
  };

  const handlePasswordChange = (ev) => {
    setPassword(ev.target.value);
    setErrorDeleteAccount(undefined);
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteUser({
        user,
        password,
      });

      dispatch(
        notifySuccess({
          message: (
            <Trans
              id="user.feedback.delete_account_sucessful"
              message="Your account has been deleted, you will be automatically disconnected."
            />
          ),
        })
      );
      signout();

      return undefined;
    } catch (errors) {
      if (
        errors?.some(
          (err) => err.message === '[RESTfacility] DeleteUser Wrong password'
        )
      ) {
        setErrorDeleteAccount([
          <Trans
            id="user.delete-form.error.incorrect_password"
            message="Unable to delete your account, the given password is incorrect."
          />,
        ]);
      } else {
        setErrorDeleteAccount(errors.map((err) => err.message));
      }

      return Promise.reject(new Error('Unable to delete account'));
    }
  };

  const handleCloseDeleteConfirm = () => {
    setPassword('');
    setErrorDeleteAccount(undefined);
  };

  return (
    <div className="s-user-profile">
      <PageTitle />
      <div className="s-user-profile__info">
        <ProfileInfo />
      </div>
      <Section
        className="s-user-profile__details"
        title={i18n._(/* i18n */ 'user.profile.form.title', undefined, {
          message: 'Complete your profile',
        })}
      >
        {user ? (
          <Formik initialValues={user} onSubmit={handleSubmit}>
            {({ handleReset, isSubmitting, touched }) => (
              <Form method="post" name="user-profile">
                {/* XXX: an errors prop can be passed  */}
                <div className="s-user-profile__profile">
                  <ProfileForm editMode={editMode} />
                </div>
                <div className="s-user-profile__actions">
                  {!editMode ? (
                    <Button onClick={() => setEditMode(true)} shape="plain">
                      <Trans id="user.action.edit_profile" message="Edit" />
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="submit"
                        shape="plain"
                        disabled={isSubmitting || !touched}
                        icon={
                          isSubmitting ? (
                            <Spinner
                              display="inline"
                              svgTitleId="update-user-spinner"
                            />
                          ) : undefined
                        }
                      >
                        <Trans id="user.action.update" message="Update" />
                      </Button>{' '}
                      <Button
                        onClick={() => {
                          setEditMode(false);
                          handleReset();
                        }}
                        shape="hollow"
                      >
                        <Trans id="user.action.cancel_edit" message="Cancel" />
                      </Button>
                    </>
                  )}
                  <Confirm
                    className="s-user-profile__delete"
                    render={(confirm) => (
                      <Button shape="plain" onClick={confirm} color="alert">
                        <Trans
                          id="user.action.delete"
                          message="Delete account"
                        />
                      </Button>
                    )}
                    title={
                      <Trans
                        id="user.delete-form.modal-title"
                        message="Delete account"
                      />
                    }
                    content={
                      <div className="s-user-profile__modal-delete-form">
                        <p>
                          <Trans
                            id="user.delete-form.modal-content"
                            message="Are you sure to delete your Caliopen account ?"
                          />
                        </p>
                        <TextFieldGroup
                          id="user-delete_password"
                          label={i18n._(
                            /* i18n */ 'user.delete-form.password.label',
                            undefined,
                            {
                              message: 'Password',
                            }
                          )}
                          inputProps={{
                            placeholder: i18n._(
                              /* i18n */ 'user.delete-form.password.placeholder',
                              undefined,
                              { message: 'password' }
                            ),
                            name: 'password',
                            type: 'password',
                            value: password,
                            onChange: handlePasswordChange,
                          }}
                          errors={errorDeleteAccount}
                        />
                      </div>
                    }
                    confirmButtonContent={
                      <Trans
                        id="user.delete-form.action.delete"
                        message="Delete my Caliopen account"
                      />
                    }
                    onConfirm={handleDeleteAccount}
                    onCancel={handleCloseDeleteConfirm}
                    onClose={handleCloseDeleteConfirm}
                  />
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          <Spinner svgTitleId="user-profile-loading" />
        )}
      </Section>
    </div>
  );
};

export default compose(withI18n())(UserProfile);
