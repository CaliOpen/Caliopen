import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Trans } from '@lingui/react';
import {
  Callout,
  CheckboxFieldGroup,
  FormGrid,
  FormRow,
  FormColumn,
} from '../../../../components';
import LastConnection from '../LastConnection';
import Status from '../Status';
import './style.scss';

class RemoteIdentityDetails extends Component {
  static propTypes = {
    remoteIdentity: PropTypes.shape({}).isRequired,
    className: PropTypes.string,
    onToggleActivate: PropTypes.func.isRequired,
    active: PropTypes.bool.isRequired,
    errors: PropTypes.shape({
      status: PropTypes.bool,
    }),
  };

  static defaultProps = {
    className: undefined,
    errors: {},
  };

  handleActivate = (event) => {
    const { checked } = event.target;

    this.props.onToggleActivate(checked);
  };

  render() {
    const { className, remoteIdentity, active, errors } = this.props;

    if (!remoteIdentity.identity_id) {
      return null;
    }

    return (
      <FormGrid className={classnames(className)}>
        <FormRow>
          <FormColumn bottomSpace>
            <Trans
              id="remote_identity.last_connection"
              defaults="Last connection: <0/>"
              components={[
                <LastConnection lastCheck={remoteIdentity.last_check} />,
              ]}
            />
          </FormColumn>
        </FormRow>
        {remoteIdentity.infos.lastFetchError && (
          <FormRow>
            <FormColumn bottomSpace>
              <Callout color="alert">
                {remoteIdentity.infos.lastFetchError}
              </Callout>
            </FormColumn>
          </FormRow>
        )}
        <FormRow>
          <FormColumn bottomSpace>
            <CheckboxFieldGroup
              checked={active}
              errors={errors.status}
              onChange={this.handleActivate}
              name="active"
              label={<Status status={active ? 'active' : 'inactive'} />}
              displaySwitch
              showTextLabel
            />
          </FormColumn>
        </FormRow>
      </FormGrid>
    );
  }
}

export default RemoteIdentityDetails;
