import { getIdentityProtocol } from './getIdentityProtocol';
import protocolsConfig from '../../../services/protocols-config';

export const isValidRecipient = ({ recipient, identity }) => {
  const { regexp } = protocolsConfig[recipient.protocol] || {};

  return (
    !identity ||
    (recipient.protocol === getIdentityProtocol(identity) &&
      regexp &&
      regexp.test(recipient.address))
  );
};
