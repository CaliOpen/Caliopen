import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import NewIdentity from './components/NewIdentity';
import RemoteIdentity from './components/RemoteIdentity';
import { PageTitle } from '../../components';

import './style.scss';

class RemoteIdentitySettings extends Component {
  static propTypes = {
    requestProviders: PropTypes.func.isRequired,
    providers: PropTypes.arrayOf(PropTypes.string),
    requestRemoteIdentities: PropTypes.func.isRequired,
    onIdentityChange: PropTypes.func.isRequired,
    onIdentityDelete: PropTypes.func.isRequired,
    identities: PropTypes.arrayOf(PropTypes.shape({})),
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    notifyError: PropTypes.func.isRequired,
    notifySuccess: PropTypes.func.isRequired,
  };

  static defaultProps = {
    identities: undefined,
    providers: undefined,
  };

  componentDidMount() {
    this.props.requestRemoteIdentities();
    this.props.requestProviders();
  }

  handleChange = async (...params) => {
    const { onIdentityChange } = this.props;

    return onIdentityChange(...params);
  };

  handleDelete = async (...params) => {
    const { onIdentityDelete } = this.props;

    return onIdentityDelete(...params);
  };

  handleError = (error) => {
    // TODO : better error handling
    // console.log(error);
    let errorMessage;
    if (error.data && error.data.errors && error.data.errors.length > 0) {
      errorMessage = error.data.errors[0].message;
    } else {
      errorMessage = this.props.i18n._(
        /* i18n */ 'remote-identity-settings.unexpected-error',
        undefined,
        { message: 'Unexpected error occured' }
      );
    }
    const { notifyError } = this.props;

    notifyError({ message: errorMessage });
  };

  handleClear = () => {
    this.props.requestRemoteIdentities();
  };

  handleCreate = async (...params) => {
    await this.handleChange(...params);
    this.handleClear();
  };

  renderIdentity(identity) {
    return (
      <div
        className="s-settings-identities__identity"
        key={identity.identity_id}
      >
        <RemoteIdentity
          remoteIdentity={identity}
          lint
          onRemoteIdentityChange={this.handleChange}
          onRemoteIdentityDelete={this.handleDelete}
          onClear={this.handleClear}
        />
      </div>
    );
  }

  render() {
    const { onIdentityDelete, identities, providers } = this.props;

    return (
      <div className="s-settings-identities">
        <PageTitle />
        <div className="s-settings-identities__create">
          <NewIdentity
            providers={providers}
            onRemoteIdentityChange={this.handleCreate}
            onRemoteIdentityDelete={onIdentityDelete}
            onClear={this.handleClear}
            onError={this.handleError}
          />
        </div>
        <Fragment>
          {identities.map((identity) => this.renderIdentity(identity))}
        </Fragment>
      </div>
    );
  }
}

export default RemoteIdentitySettings;
