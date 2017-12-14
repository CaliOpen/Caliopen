import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../../components/Button';
import PageTitle from '../../components/PageTitle';
import Section from '../../components/Section';
import ProfileForm from './components/ProfileForm';
import ProfileInfo from './components/ProfileInfo';

import './style.scss';

class UserProfile extends Component {
  static propTypes = {
    __: PropTypes.func.isRequired,
    requestUser: PropTypes.func.isRequired,
    updateContact: PropTypes.func.isRequired,
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

  handleUserChange = ({ contact, original }) => {
    this.props.updateContact({ contact, original }).then(() => this.props.requestUser());
  }

  toggleEditMode = () => {
    this.setState({ editMode: !this.state.editMode });
  }

  render() {
    const { user, __ } = this.props;

    return (
      <div className="s-user-profile">
        <PageTitle />
        <div className="s-user-profile__actions">
          {this.state.editMode === true ? (
            <Button onClick={this.toggleEditMode}>{__('user.action.cancel_edit')}</Button>
          ) : (
            <Button onClick={this.toggleEditMode}>{__('user.action.edit_profile')}</Button>
          )}
          <Button onClick={str => str}>{__('user.action.share_profile')}</Button>
        </div>
        <div className="s-user-profile__info">
          <ProfileInfo user={user} />
        </div>
        <Section className="s-user-profile__details" title={__('user.profile.form.title')}>
          {
            // FIXME: should show ProfileDetails if editMode === false
          }
          <ProfileForm
            user={user}
            onUpdateUser={this.handleUserChange}
          />
        </Section>
      </div>
    );
  }
}

export default UserProfile;
