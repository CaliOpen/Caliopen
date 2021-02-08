import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
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
import { deleteUser } from '../../modules/user';

import './style.scss';

class UserProfile extends Component {
  static propTypes = {
    requestUser: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    pristine: PropTypes.bool.isRequired,
    submitting: PropTypes.bool.isRequired,
    notifyError: PropTypes.func.isRequired,
    notifySuccess: PropTypes.func.isRequired,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    user: PropTypes.shape({}),
  };

  static defaultProps = {
    user: undefined,
  };

  state = {
    editMode: false,
    password: '',
    errorDeleteAccount: undefined,
  };

  componentDidMount() {
    this.props.requestUser();
  }

  handleSubmit = (ev) => {
    const { handleSubmit } = this.props;
    handleSubmit(ev).then(this.handleSuccess, this.handleError);
  };

  handleSuccess = async () => {
    await this.props.requestUser();

    return this.toggleEditMode();
  };

  handleError = () => {
    const { i18n, notifyError } = this.props;
    notifyError({
      message: i18n._('contact.feedback.unable_to_save', null, {
        defaults: 'Unable to save the contact',
      }),
    });
  };

  handlePasswordChange = (ev) => {
    this.setState({ password: ev.target.value, errorDeleteAccount: undefined });
  };

  handleDeleteAccount = async () => {
    try {
      await deleteUser({
        user: this.props.user,
        password: this.state.password,
      });
      await this.props.notifySuccess({
        message: (
          <Trans id="user.feedback.delete_account_sucessful">
            Your account has been deleted, you will be automatically
            disconnected.
          </Trans>
        ),
      });
      signout();

      return undefined;
    } catch (errors) {
      if (
        errors.some(
          (err) => err.message === '[RESTfacility] DeleteUser Wrong password'
        )
      ) {
        this.setState({
          errorDeleteAccount: [
            <Trans id="user.delete-form.error.incorrect_password">
              Unable to delete your account, the given password is incorrect.
            </Trans>,
          ],
        });
      } else {
        this.setState({
          errorDeleteAccount: errors.map((err) => err.message),
        });
      }

      return Promise.reject(new Error('Unable to delete account'));
    }
  };

  handleCloseDeleteConfirm = () => {
    this.setState({ password: '', errorDeleteAccount: undefined });
  };

  toggleEditMode = () => {
    this.setState((prevState) => ({ editMode: !prevState.editMode }));
  };

  renderForm = () => {
    const { pristine, submitting, i18n } = this.props;

    return (
      <form method="post" name="user-profile" onSubmit={this.handleSubmit}>
        <ProfileForm editMode={this.state.editMode} />
        <div className="s-user-profile__actions">
          {!this.state.editMode ? (
            <Button onClick={this.toggleEditMode} shape="plain">
              <Trans id="user.action.edit_profile">Edit</Trans>
            </Button>
          ) : (
            <div>
              <Button
                type="submit"
                shape="plain"
                disabled={submitting || pristine}
              >
                <Trans id="user.action.update">Update</Trans>
              </Button>{' '}
              <Button onClick={this.toggleEditMode} shape="hollow">
                <Trans id="user.action.cancel_edit">Cancel</Trans>
              </Button>
            </div>
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
                  label={i18n._('user.delete-form.password.label', null, {
                    defaults: 'Password',
                  })}
                  placeholder={i18n._(
                    'user.delete-form.password.placeholder',
                    null,
                    { defaults: 'password' }
                  )}
                  name="password"
                  type="password"
                  value={this.state.password}
                  errors={this.state.errorDeleteAccount}
                  onChange={this.handlePasswordChange}
                />
              </div>
            }
            confirmButtonContent={
              <Trans id="user.delete-form.action.delete">
                Delete my Caliopen account
              </Trans>
            }
            onConfirm={this.handleDeleteAccount}
            onCancel={this.handleCloseDeleteConfirm}
            onClose={this.handleCloseDeleteConfirm}
          />
        </div>
      </form>
    );
  };

  render() {
    const { user, i18n } = this.props;

    return (
      <div className="s-user-profile">
        <PageTitle />
        <div className="s-user-profile__info">
          <ProfileInfo user={user} />
        </div>
        <Section
          className="s-user-profile__details"
          title={i18n._('user.profile.form.title', null, {
            defaults: 'Complete your profile',
          })}
        >
          {this.renderForm()}
        </Section>
      </div>
    );
  }
}

export default UserProfile;
