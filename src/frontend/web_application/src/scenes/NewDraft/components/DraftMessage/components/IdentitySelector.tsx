import * as React from 'react';
import classnames from 'classnames';
import { Trans } from '@lingui/react';
import { AdvancedSelectFieldGroup, Icon } from 'src/components';
import {
  PROVIDER_EMAIL,
  PROVIDER_GMAIL,
  PROVIDER_TWITTER,
  PROVIDER_MASTODON,
  ProviderIcon,
} from 'src/modules/remoteIdentity';
import { IIdentity } from 'src/modules/identity/types';

interface Props {
  identityId: undefined | string;
  identities: IIdentity[];
  className?: string;
  onChange: (identity?: IIdentity) => void;
}

function IdentitySelector({
  identityId,
  identities,
  className,
  onChange,
}: Props) {
  const handleChange = (value: string) => {
    const identity = identities.find((curr) => curr.identity_id === value);
    onChange(identity);
  };

  const renderProvider = (identity: IIdentity) => {
    switch (identity?.infos.provider || '') {
      default:
      case PROVIDER_EMAIL:
        return <Icon type="email" />;
      case PROVIDER_GMAIL:
      case PROVIDER_TWITTER:
      case PROVIDER_MASTODON:
        return (
          <ProviderIcon providerName={identity?.infos.provider} size="normal" />
        );
    }
  };

  return (
    <div className={classnames(className)}>
      <AdvancedSelectFieldGroup
        selectId="identity-select"
        dropdownId="identity-select-dropdown"
        label={<Trans id="draft-message.form.identity.label">From:</Trans>}
        placeholder={
          <Trans id="draft-message.form.identity.placeholder">
            What&apos;s your identity ?
          </Trans>
        }
        onChange={handleChange}
        value={identityId}
        inline
        options={identities.map((identity) => ({
          label: `${identity.display_name} <${identity.identifier}>`,
          advancedlabel: (
            <>
              {renderProvider(identity)} {identity.display_name} &lt;
              {identity.identifier}
              &gt;
            </>
          ),
          value: identity.identity_id,
        }))}
      />
    </div>
  );
}

export default IdentitySelector;
