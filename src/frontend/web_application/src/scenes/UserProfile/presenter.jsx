import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'lingui-react';
import { Section, PageTitle, Button } from '../../components/';
import ProfileForm from './components/ProfileForm';
import ProfileInfo from './components/ProfileInfo';

import './style.scss';

class UserProfile extends Component {
  static propTypes = {
    requestUser: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    pristine: PropTypes.bool.isRequired,
    submitting: PropTypes.bool.isRequired,
    notifyError: PropTypes.func.isRequired,
    i18n: PropTypes.shape({}).isRequired,
    user: PropTypes.shape({}),
  };

  static defaultProps = {
    user: undefined,
  };

  state = {
    editMode: false,
  }

  componentDidMount() {
    this.props.requestUser();
  }

  handleSubmit = (ev) => {
    const { handleSubmit } = this.props;
    handleSubmit(ev)
      .then(this.handleSuccess, this.handleError);
  }

  handleSuccess = async () => {
    await this.props.requestUser();

    return this.toggleEditMode();
  }

  handleError = () => {
    const { i18n, notifyError } = this.props;
    notifyError({ message: i18n._('contact.feedback.unable_to_save', { defaults: 'Unable to save the contact' }) });
  }

  toggleEditMode = () => {
    this.setState({ editMode: !this.state.editMode });
  }

  renderForm = () => {
    const { pristine, submitting } = this.props;

    return (
      <form method="post" name="user-profile" onSubmit={this.handleSubmit}>
        <ProfileForm editMode={this.state.editMode} />
        {!this.state.editMode ? (
          <Button onClick={this.toggleEditMode} shape="plain">
            <Trans id="user.action.edit_profile">Edit</Trans>
          </Button>
        ) : (
          <div>
            <Button type="submit" shape="plain" disabled={submitting || pristine}>
              <Trans id="user.action.update">Update</Trans>
            </Button>
            {' '}
            <Button onClick={this.toggleEditMode} shape="hollow">
              <Trans id="user.action.cancel_edit">Cancel</Trans>
            </Button>
          </div>
        )}

      </form>
    );
  }

  render() {
    const { user, i18n } = this.props;

    return (
      <div className="s-user-profile">
        <PageTitle />
        <div className="s-user-profile__info">
          <ProfileInfo user={user} />
        </div>
        <Section className="s-user-profile__details" title={i18n._('user.profile.form.title', { defaults: 'Complete your profile' })}>
          {this.renderForm()}
        </Section>
      </div>
    );
  }
}

export default UserProfile;
