import { asciify } from '../asciify';

// initialize a contact, usefull for redux-form to prevent recursiv delete of initial values if a
// propoerty is undefined
export const getNewContact = () => ({
  name_prefix: '',
  given_name: '',
  family_name: '',
  name_suffix: '',
  organizations: [],
  identities: [],
  infos: {},
  emails: [],
  phones: [],
  ims: [],
  addresses: [],
});

export function getContactTitle(contact) {
  return contact.title || '';
}

export function formatName({ contact, format }) {
  const title = format
    .split(',')
    .map((field) => field.trim())
    .map((field) => contact[field])
    .join(' ')
    .trim();

  return title || getContactTitle(contact);
}

export function getFirstLetter(string, defaultLetter) {
  let firstLetter = defaultLetter;
  if (string) {
    firstLetter = asciify(string.substr(0, 1).toLowerCase());
  }

  if (!/^[a-z]$/.test(firstLetter)) {
    firstLetter = defaultLetter;
  }

  return firstLetter;
}
