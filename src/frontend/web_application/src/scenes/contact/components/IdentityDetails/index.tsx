import * as React from 'react';
import { SocialIdentity } from 'src/modules/contact/types';
import { Icon } from '../../../../components';

interface Props {
  identity: SocialIdentity;
}
function IdentityDetails({ identity }: Props): JSX.Element {
  return (
    <span className="m-identity-details">
      <Icon type={identity.type} rightSpaced />
      {identity.name}
    </span>
  );
}

export default IdentityDetails;
