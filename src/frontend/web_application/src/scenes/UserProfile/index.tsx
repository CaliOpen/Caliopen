import * as React from 'react';
import { Trans, withI18n, withI18nProps } from '@lingui/react';
import { useDispatch } from 'react-redux';
import { InjectedFormProps, reduxForm } from 'redux-form';
import { notifyError, notifySuccess } from 'src/modules/userNotify';
import {
  Section,
  PageTitle,
  Button,
  Confirm,
  TextFieldGroup,
} from '../../components';
import ProfileForm from './components/ProfileForm';
import ProfileInfo from './components/ProfileInfo';
import { signout } from '../../modules/routing';
import { deleteUser, useUser } from '../../modules/user';

import './style.scss';
import { compose } from 'redux';
interface Props extends withI18nProps, InjectedFormProps {}

const UserProfile = ({ i18n, submitting, pristine, handleSubmit }: Props) => {
  const dispatch = useDispatch();
  const [editMode, setEditMode] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [errorDeleteAccount, setErrorDeleteAccount] = React.useState<
    undefined | React.ReactNode[]
  >();

  const { user } = useUser();

  const handleSuccess = async () => {
    setEditMode(false);
  };

  const handleError = (err) => {
    console.log({ err });

    dispatch(
      notifyError({
        message: i18n._('contact.feedback.unable_to_save', undefined, {
          defaults: 'Unable to save the contact',
        }),
      })
    );
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
            <Trans id="user.feedback.delete_account_sucessful">
              Your account has been deleted, you will be automatically
              disconnected.
            </Trans>
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
          <Trans id="user.delete-form.error.incorrect_password">
            Unable to delete your account, the given password is incorrect.
          </Trans>,
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

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
  };

  return (
    <div className="s-user-profile">
      <PageTitle />
      <div className="s-user-profile__info">
        <ProfileInfo />
      </div>
      <Section
        className="s-user-profile__details"
        title={i18n._('user.profile.form.title', undefined, {
          defaults: 'Complete your profile',
        })}
      >
        <form
          method="post"
          name="user-profile"
          onSubmit={(ev) => {
            // @ts-ignore
            handleSubmit(ev).then(handleSuccess, handleError);
          }}
        >
          {/* XXX: an errors prop can be passed  */}
          <ProfileForm editMode={editMode} />
          <div className="s-user-profile__actions">
            {!editMode ? (
              <Button onClick={toggleEditMode} shape="plain">
                <Trans id="user.action.edit_profile">Edit</Trans>
              </Button>
            ) : (
              <>
                <Button
                  type="submit"
                  shape="plain"
                  disabled={submitting || pristine}
                >
                  <Trans id="user.action.update">Update</Trans>
                </Button>{' '}
                <Button onClick={toggleEditMode} shape="hollow">
                  <Trans id="user.action.cancel_edit">Cancel</Trans>
                </Button>
              </>
            )}
            <Confirm
              className="s-user-profile__delete"
              render={(confirm) => (
                <Button shape="plain" onClick={confirm} color="alert">
                  <Trans id="user.action.delete">Delete account</Trans>
                </Button>
              )}
              title={
                <Trans id="user.delete-form.modal-title">Delete account</Trans>
              }
              content={
                <div className="s-user-profile__modal-delete-form">
                  <p>
                    <Trans id="user.delete-form.modal-content">
                      Are you sure to delete your Caliopen account ?
                    </Trans>
                  </p>
                  <TextFieldGroup
                    label={i18n._(
                      'user.delete-form.password.label',
                      undefined,
                      {
                        defaults: 'Password',
                      }
                    )}
                    placeholder={i18n._(
                      'user.delete-form.password.placeholder',
                      undefined,
                      { defaults: 'password' }
                    )}
                    name="password"
                    type="password"
                    value={password}
                    errors={errorDeleteAccount}
                    onChange={handlePasswordChange}
                  />
                </div>
              }
              confirmButtonContent={
                <Trans id="user.delete-form.action.delete">
                  Delete my Caliopen account
                </Trans>
              }
              onConfirm={handleDeleteAccount}
              onCancel={handleCloseDeleteConfirm}
              onClose={handleCloseDeleteConfirm}
            />
          </div>
        </form>
      </Section>
    </div>
  );
};

export default compose(
  withI18n(),
  reduxForm({
    form: 'user-profile',
    enableReinitialize: true,
    // fixme initialvalues
  })
)(UserProfile);
