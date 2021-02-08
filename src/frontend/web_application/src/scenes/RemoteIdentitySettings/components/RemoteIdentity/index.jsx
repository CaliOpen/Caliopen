import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Section, Icon } from '../../../../components';
import {
  PROVIDER_EMAIL,
  PROVIDER_GMAIL,
  PROVIDER_TWITTER,
  PROVIDER_MASTODON,
  ProviderIcon,
} from '../../../../modules/remoteIdentity';
import RemoteIdentityEmail from '../RemoteIdentityEmail';
import RemoteIdentityOauth from '../RemoteIdentityOauth';

class RemoteIdentity extends Component {
  static propTypes = {
    remoteIdentity: PropTypes.shape({}),
    onRemoteIdentityChange: PropTypes.func.isRequired,
    onRemoteIdentityDelete: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
  };

  static defaultProps = {
    remoteIdentity: undefined,
  };

  renderType() {
    const {
      onRemoteIdentityDelete,
      onRemoteIdentityChange,
      remoteIdentity,
    } = this.props;

    const renderComponent = (C) => (
      <C
        key={remoteIdentity.identity_id || 'new'}
        remoteIdentity={remoteIdentity}
        onChange={onRemoteIdentityChange}
        onDelete={onRemoteIdentityDelete}
        clear={this.props.onClear}
      />
    );

    switch (remoteIdentity.infos.provider) {
      default:
      case PROVIDER_EMAIL:
        return renderComponent(RemoteIdentityEmail);
      case PROVIDER_GMAIL:
      case PROVIDER_TWITTER:
      case PROVIDER_MASTODON:
        return renderComponent(RemoteIdentityOauth);
    }
  }

  renderIcon = (remoteIdentity) => {
    if (!remoteIdentity.infos.provider) {
      return <Icon type="email" rightSpaced />;
    }

    return (
      <ProviderIcon
        className="m-remote-identity__provider-logo"
        providerName={remoteIdentity.infos.provider}
      />
    );
  };

  renderTitle() {
    const { remoteIdentity } = this.props;
    const displayName = remoteIdentity.display_name || 'N/A';

    return (
      <Fragment>
        {this.renderIcon(remoteIdentity)}
        {displayName}
      </Fragment>
    );
  }

  render() {
    const remoteIdentity =
      this.props.remoteIdentity || this.state.newRemoteIdentity;
    const context = remoteIdentity.status === 'active' ? 'safe' : 'disabled';

    return (
      <Section title={this.renderTitle(remoteIdentity)} borderContext={context}>
        {this.renderType()}
      </Section>
    );
  }
}

export default RemoteIdentity;
