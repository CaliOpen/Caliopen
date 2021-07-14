import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import classnames from 'classnames';
import {
  Spinner,
  TextFieldGroup,
  FormGrid,
  FormRow,
  FormColumn,
} from '../../../../components';
import { capitalize } from '../../../../services/capitalize';
import {
  PROVIDER_GMAIL,
  PROVIDER_TWITTER,
  PROVIDER_MASTODON,
  withAuthorize,
  ProviderIcon,
} from '../../../../modules/remoteIdentity';
import ProviderButton from '../ProviderButton';
import './style.scss';

@withAuthorize()
class AuthButton extends Component {
  static propTypes = {
    className: PropTypes.string,
    onDone: PropTypes.func.isRequired,
    authorize: PropTypes.func.isRequired,
    providerName: PropTypes.oneOf([
      PROVIDER_GMAIL,
      PROVIDER_TWITTER,
      PROVIDER_MASTODON,
    ]).isRequired,
  };

  static defaultProps = {
    className: undefined,
  };

  state = {
    hasActivity: false,
    mastodonAcct: '',
  };

  handleAcctChange = (event) => {
    this.setState({ mastodonAcct: event.target.value });
  };

  authorize = async () => {
    const { authorize, onDone, providerName } = this.props;
    const identifier = this.state.mastodonAcct;
    this.setState({
      hasActivity: true,
    });

    try {
      const result = await authorize({ providerName, identifier });
      onDone(result);
    } catch (err) {
      onDone(err);
    } finally {
      this.setState({
        hasActivity: false,
      });
    }
  };

  render() {
    const { className, providerName } = this.props;

    return (
      <FormGrid>
        <FormRow>
          <ProviderButton
            onClick={this.authorize}
            shape="plain"
            className={classnames(className, 'm-oauth-button')}
            disabled={this.state.hasActivity}
          >
            {this.state.hasActivity ? (
              <Spinner
                svgTitleId={`authorize-provider-${providerName}-spinner`}
                isloading
              />
            ) : (
              <ProviderIcon
                className="m-oauth-button__logo"
                providerName={providerName}
              />
            )}
            {capitalize(providerName)}
          </ProviderButton>
        </FormRow>
        {providerName === PROVIDER_MASTODON && (
          <FormRow>
            <FormColumn bottomSpace fluid>
              <TextFieldGroup
                label={
                  <Trans id="remote_identity.form.mastodon.instance_label">
                    Before pushing Mastodon button, enter your account address
                    below (ex.: username@instance.tld)
                  </Trans>
                }
                value={this.state.mastodonAcct}
                onChange={this.handleAcctChange}
                name="mastodonAcct"
                autoComplete="on"
                required
              />
            </FormColumn>
          </FormRow>
        )}
      </FormGrid>
    );
  }
}

export default AuthButton;
