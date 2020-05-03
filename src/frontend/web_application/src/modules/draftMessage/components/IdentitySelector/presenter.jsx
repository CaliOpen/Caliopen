import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Trans } from '@lingui/react';
import { AdvancedSelectFieldGroup, Icon } from '../../../../components';
import {
  PROVIDER_EMAIL,
  PROVIDER_GMAIL,
  PROVIDER_TWITTER,
  PROVIDER_MASTODON,
  ProviderIcon,
} from '../../../remoteIdentity';

class IdentitySelector extends Component {
  static propTypes = {
    identityId: PropTypes.string,
    className: PropTypes.string,
    identities: PropTypes.arrayOf(PropTypes.shape({})),
    onChange: PropTypes.func.isRequired,
  };

  static defaultProps = {
    className: undefined,
    identityId: '',
    identities: undefined,
  };

  handleChange = (ev) => {
    const { value } = ev.target;
    const { onChange, identities } = this.props;
    const identity = identities.find((curr) => curr.identity_id === value);
    onChange({ identity });
  };

  renderProvider = ({ identity }) => {
    switch (identity.infos.provider) {
      default:
      case PROVIDER_EMAIL:
        return <Icon type="email" />;
      case PROVIDER_GMAIL:
      case PROVIDER_TWITTER:
      case PROVIDER_MASTODON:
        return (
          <ProviderIcon providerName={identity.infos.provider} size="normal" />
        );
    }
  };

  render() {
    const { className, identities, identityId } = this.props;

    return (
      <div className={classnames(className)}>
        <AdvancedSelectFieldGroup
          label={<Trans id="draft-message.form.identity.label">From:</Trans>}
          placeholder={
            <Trans id="draft-message.form.identity.placeholder">
              What&apos;s your identity ?
            </Trans>
          }
          onChange={this.handleChange}
          value={identityId}
          decorated={false}
          inline
          options={identities.map((identity) => ({
            label: `${identity.display_name} <${identity.identifier}>`,
            advancedlabel: (
              <Fragment>
                {this.renderProvider({ identity })} {identity.display_name} &lt;
                {identity.identifier}
                &gt;
              </Fragment>
            ),
            value: identity.identity_id,
            // disabled
            // info ?
          }))}
        />
      </div>
    );
  }
}

export default IdentitySelector;
