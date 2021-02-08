import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Trans, withI18n } from '@lingui/react';
import { Confirm, Button } from '../../../../components';
import {
  REMOTE_IDENTITY_STATUS_ACTIVE,
  REMOTE_IDENTITY_STATUS_INACTIVE,
  Identity,
} from '../../../../modules/remoteIdentity';
import RemoteIdentityDetails from '../RemoteIdentityDetails';

@withI18n()
class RemoteIdentitOauth extends Component {
  static propTypes = {
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    className: PropTypes.string,
    remoteIdentity: PropTypes.shape({}).isRequired,
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
  };

  static defaultProps = {
    className: undefined,
  };

  state = {
    remoteIdentity: {
      identifier: '',
      active: true,
    },
  };

  UNSAFE_componentWillMount() {
    this.setState(this.getStateFromProps());
  }

  getStateFromProps = () => {
    const {
      remoteIdentity: { identifier, status },
    } = this.props;
    const active = status
      ? status === REMOTE_IDENTITY_STATUS_ACTIVE
      : this.state.remoteIdentity.active;

    return {
      remoteIdentity: {
        ...this.state.remoteIdentity,
        identifier,
        active,
      },
    };
  };

  getIdentityFromState = () => {
    const {
      remoteIdentity: { identifier, active },
    } = this.state;
    const { remoteIdentity } = this.props;

    return new Identity({
      ...remoteIdentity,
      identifier,
      display_name: identifier,
      status: active
        ? REMOTE_IDENTITY_STATUS_ACTIVE
        : REMOTE_IDENTITY_STATUS_INACTIVE,
    });
  };

  handleDelete = () => {
    const { remoteIdentity, onDelete } = this.props;

    onDelete({ identity: remoteIdentity });
  };

  handleActivate = (active) => {
    this.setState(
      (prevState) => ({
        remoteIdentity: {
          ...prevState.remoteIdentity,
          active,
        },
      }),
      () => {
        const identity = this.getIdentityFromState();
        this.props.onChange({ identity });
      }
    );
  };

  renderActions() {
    return (
      <div>
        <Confirm
          title={
            <Trans id="remote_identity.confirm-delete.title">
              Delete the external account
            </Trans>
          }
          content={
            <Trans id="remote_identity.confirm-delete.content">
              The external account will deactivated then deleted.
            </Trans>
          }
          onConfirm={this.handleDelete}
          render={(confirm) => (
            <Button
              onClick={confirm}
              shape="plain"
              color="alert"
              className="m-remote-identity-email__action"
            >
              <Trans id="remote_identity.action.delete">Delete</Trans>
            </Button>
          )}
        />
      </div>
    );
  }

  renderContent() {
    const { remoteIdentity } = this.props;

    return (
      <RemoteIdentityDetails
        remoteIdentity={remoteIdentity}
        onToggleActivate={this.handleActivate}
        onChange={this.handleChange}
        onDelete={this.handleDelete}
        onEdit={this.handleToggleEdit}
        onClear={this.handleClear}
        active={this.state.remoteIdentity.active}
      />
    );
  }

  render() {
    const { className } = this.props;

    return (
      <div className={classnames(className)}>
        {this.renderContent()}
        {this.renderActions()}
      </div>
    );
  }
}

export default RemoteIdentitOauth;
