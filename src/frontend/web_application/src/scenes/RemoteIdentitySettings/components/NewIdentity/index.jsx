import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import { Section, Callout, Icon, Title } from '../../../../components';
import {
  PROVIDER_GMAIL,
  PROVIDER_TWITTER,
  PROVIDER_MASTODON,
} from '../../../../modules/remoteIdentity';
import RemoteIdentityEmail from '../RemoteIdentityEmail';
import AuthButton from '../AuthButton';
import ProviderButtonContainer from '../ProviderButtonContainer';
import ProviderButton from '../ProviderButton';
import './provider-list.scss';
import './new-identity.scss';
import './provider-email-button.scss';

class NewIdentity extends Component {
  static propTypes = {
    providers: PropTypes.arrayOf(PropTypes.string),
    onRemoteIdentityChange: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
  };

  static defaultProps = {
    providers: [],
  };

  state = {
    emailFormOpened: false,
  };

  handleToggleFormEmail = () => {
    this.setState((prevState) => ({
      emailFormOpened: !prevState.emailFormOpened,
    }));
  };

  handleChangeRemoteIdentityEmail = async (...params) => {
    const { onRemoteIdentityChange } = this.props;
    await onRemoteIdentityChange(...params);
    this.handleToggleFormEmail();
    this.props.onClear();
  };

  handleOAuthDone = (result) => {
    if (result && result.response) {
      this.props.onError(result.response);
    }
    this.props.onClear();
  };

  render() {
    const { providers } = this.props;

    return (
      <Section
        title={
          <Trans
            id="remote_identity.add_account"
            message="Add an external account"
          />
        }
        titleProps={{ size: 'large' }}
        className="m-new-identity"
        shape="none"
      >
        <p className="m-new-identity__main-help">
          <Trans id="remote_identity.create_help">
            Add an external account will allow you to aggregate messages for
            this account in your Caliopen inbox and answer to your contacts
            using one of these acounts.
          </Trans>
        </p>
        <Callout color="info">
          <Trans
            id="remote_identity.how_to"
            components={[<p />, <br />]}
            message={`
            <0>
              External accounts are fetched every 15 minutes. <1 />
              Currently there is no indicator to inform that the account is correctly configured until first try is done.
            </0>
            `}
          />
        </Callout>
        <Title hr>
          <Trans
            id="remote_identity.choose-provider.title"
            message="Select a provider"
          />
        </Title>
        <ul className="m-provider-list">
          {providers.includes(PROVIDER_GMAIL) && (
            <li className="m-provider-list__provider">
              <ProviderButtonContainer
                label={
                  <Trans
                    id="remote_identity.gmail.help"
                    message="You will be redirected to gmail authentication"
                  />
                }
              >
                <AuthButton
                  onDone={this.handleOAuthDone}
                  providerName={PROVIDER_GMAIL}
                />
              </ProviderButtonContainer>
            </li>
          )}
          {providers.includes(PROVIDER_TWITTER) && (
            <li className="m-provider-list__provider">
              <ProviderButtonContainer
                label={
                  <Trans id="remote_identity.twitter.help">
                    You will be redirected to twitter authentication and
                    authorize the application
                  </Trans>
                }
              >
                <AuthButton
                  onDone={this.handleOAuthDone}
                  providerName={PROVIDER_TWITTER}
                />
              </ProviderButtonContainer>
            </li>
          )}
          {providers.includes(PROVIDER_MASTODON) && (
            <li className="m-provider-list__provider">
              <ProviderButtonContainer
                label={
                  <Trans id="remote_identity.mastodon.help">
                    You will be redirected to mastodon authentication and
                    authorize the application
                  </Trans>
                }
              >
                <AuthButton
                  onDone={this.handleOAuthDone}
                  providerName={PROVIDER_MASTODON}
                />
              </ProviderButtonContainer>
            </li>
          )}
          <li className="m-provider-list__provider">
            <ProviderButtonContainer
              label={
                <Trans id="remote_identity.email.help">
                  You will have to fill the form with your imap server&apos;s
                  parameters
                </Trans>
              }
            >
              <ProviderButton onClick={this.handleToggleFormEmail}>
                <Icon
                  className="m-provider-email-button__icon"
                  type="email"
                  rightSpaced
                />
                <Trans
                  id="remote_identity.action.toggle-email-form"
                  message="Email (via IMAP)"
                />
              </ProviderButton>
            </ProviderButtonContainer>
          </li>
        </ul>
        {this.state.emailFormOpened && (
          <RemoteIdentityEmail
            className="m-new-identity__email-form"
            onChange={this.handleChangeRemoteIdentityEmail}
            onCancel={this.handleToggleFormEmail}
          />
        )}
      </Section>
    );
  }
}

export default NewIdentity;
