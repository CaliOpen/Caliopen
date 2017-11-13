import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
// import OpenPGPKeysDetails from './components/OpenPGPKeysDetails';
// import TFAForm from './components/TFAForm';
import PasswordDetails from './components/PasswordDetails';
import LoginDetails from './components/LoginDetails';
import Section from '../../components/Section';
import './style.scss';

class UserSecurity extends Component {
  static propTypes = {
    __: PropTypes.func.isRequired,
    requestUser: PropTypes.func.isRequired,
    user: PropTypes.shape({}).isRequired,
    notifySuccess: PropTypes.func.isRequired,
    notifyError: PropTypes.func.isRequired,
  };

  state = {
    updated: false,
  };

  componentDidMount() {
    this.props.requestUser();
  }

  handleSubmit = (data) => {
    const { user } = this.props;
    axios.patch(`/api/v2/users/${user.user_id}`, {
      ...data,
    }, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    }).then(this.handleSubmitSuccess, this.handleSubmitError);
  }

  handleSubmitSuccess = () => {
    this.setState({ updated: true, errors: {} }, () => {
      const { requestUser, notifySuccess, __ } = this.props;
      notifySuccess({ message: __('password.form.feedback.successfull'), duration: 0 });
      requestUser();
    });
  }

  handleSubmitError = ({ response }) => {
    const { notifyError, __ } = this.props;

    if (response.status === 424) {
      return notifyError({ message: __('password.form.feedback.error-old-password'), duration: 0 });
    }

    return notifyError({ message: __('password.form.feedback.unexpected-error'), duration: 0 });
  }

  render() {
    const { __, user } = this.props;

    return (
      <div className="s-user-account-security">
        <form method="post" name="user_security_form">
          <Section title={__('user.security.section_password.title')}>
            <div className="s-user-account-security__credentials">
              <div className="s-user-account-security__login">
                <LoginDetails user={user} __={__} />
              </div>
              <div className="s-user-account-security__password">
                <PasswordDetails
                  user={user}
                  __={__}
                  updated={this.state.updated}
                  onSubmit={this.handleSubmit}
                />
              </div>
            </div>
          </Section>
          {/* TODO: enable TFA and PGP sections
            <Section title={__('user.security.section_tfa.title')}>
            <TFAForm user={user} />
          </Section>
          <Section title={__('user.security.section_pgpkeys.title')}>
            <OpenPGPKeysDetails user={user} />
          </Section>
          */}
        </form>
      </div>
    );
  }
}

export default UserSecurity;
