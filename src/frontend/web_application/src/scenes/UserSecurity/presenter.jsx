import React, { Component } from 'react';
import PropTypes from 'prop-types';
import getClient from '../../services/api-client';
import OpenPGPPrivateKeys from './components/OpenPGPPrivateKeys';
import { PageTitle, Section } from '../../components';
import PasswordDetails from './components/PasswordDetails';
import LoginDetails from './components/LoginDetails';

import './style.scss';

class UserSecurity extends Component {
  static propTypes = {
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    requestUser: PropTypes.func.isRequired,
    userState: PropTypes.shape({ user: PropTypes.shape({}) }).isRequired,
    notifySuccess: PropTypes.func.isRequired,
    notifyError: PropTypes.func.isRequired,
  };

  state = {
    updated: false,
  };

  componentDidMount() {
    this.saveKey =
      /* eslint-disable-next-line */
      require('../../services/openpgp-keychain-repository').saveKey;

    this.props.requestUser();
  }

  handleSubmit = (data) => {
    const { user } = this.props;
    getClient()
      .patch(`/api/v2/users/${user.user_id}`, {
        ...data,
      })
      .then(this.handleSubmitSuccess, this.handleSubmitError);
  };

  handleSubmitSuccess = () => {
    this.setState({ updated: true }, () => {
      const { requestUser, notifySuccess, i18n } = this.props;
      notifySuccess({
        message: i18n._(/* i18n */ 'password.form.feedback.successfull', null, {
          message: 'Password updated!',
        }),
        duration: 0,
      });
      requestUser();
    });
  };

  handleSubmitError = ({ response }) => {
    const { notifyError, i18n } = this.props;

    if (response.status === 424) {
      return notifyError({
        message: i18n._(
          /* i18n */ 'password.form.feedback.error-old-password',
          null,
          {
            message: 'Wrong old password.',
          }
        ),
        duration: 0,
      });
    }

    return notifyError({
      message: i18n._(
        /* i18n */ 'password.form.feedback.unexpected-error',
        null,
        {
          message: 'Error when updating password.',
        }
      ),
      duration: 0,
    });
  };

  render() {
    const {
      i18n,
      userState: { user },
    } = this.props;

    return (
      <div className="s-user-account-security">
        <PageTitle />
        <form method="post" name="user_security_form">
          <Section
            title={i18n._(
              /* i18n */ 'user.security.section_password.title',
              null,
              {
                message: 'Customize your interface',
              }
            )}
          >
            <div className="s-user-account-security__credentials">
              <div className="s-user-account-security__login">
                <LoginDetails user={user} />
              </div>
              <div className="s-user-account-security__password">
                <PasswordDetails
                  user={user}
                  updated={this.state.updated}
                  onSubmit={this.handleSubmit}
                />
              </div>
            </div>
          </Section>
        </form>
        {/* TODO: enable TFA section
          <Section
          title={i18n._(/* i18n 'user.security.section_tfa.title',
            null, { message: '2-factor authentication' })}
          >
            <TFAForm user={user} />
          </Section>
          */}
        <Section
          title={i18n._(
            /* i18n */ 'user.security.section_pgpkeys.title',
            null,
            {
              message: 'PGP private keys',
            }
          )}
        >
          <OpenPGPPrivateKeys />
        </Section>
      </div>
    );
  }
}

export default UserSecurity;
