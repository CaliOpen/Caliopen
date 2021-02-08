import isEqual from 'lodash.isequal';
import { addAddressesToContact, updateContact } from '../../contact';
import { PROTOCOL_EMAIL } from '../../remoteIdentity';
import { updatePublicKey } from './updatePublicKey';

export const saveUserPublicKeyAction = (
  publicKeyArmored,
  { contact }
) => async (dispatch, getState) => {
  const openpgp = await import(/* webpackChunkName: "openpgp" */ 'openpgp');
  const publicKey = await openpgp.key.readArmored(publicKeyArmored);
  const keyEmails = publicKey.keys[0].users.map(({ userId }) => userId.email);
  const contactEmails = contact.emails.map((email) => email.address);

  const missingEmails = keyEmails
    .filter((email) => !contactEmails.includes(email))
    .map((email) => ({ email, protocol: PROTOCOL_EMAIL }));
  const contactWithNewEmails = addAddressesToContact(contact, missingEmails);

  if (!isEqual(contact, contactWithNewEmails)) {
    // Await needed in case no email coincides in pubKey/contact.
    await updateContact({
      contact: contactWithNewEmails,
      original: contact,
    })(dispatch, getState);
  }

  return dispatch(updatePublicKey(contactWithNewEmails, publicKeyArmored));
};
