import * as React from 'react';
import { ContactCommon } from 'src/modules/contact/types';
import { Icon } from '../../../../components';

interface Props {
  identity: NonNullable<ContactCommon['identities']>[number];
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
