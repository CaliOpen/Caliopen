import { asciify } from 'src/services/asciify';
import { Contact, ContactPayload } from '../types';

export function getContactTitle(contact: Contact | ContactPayload) {
  return contact.title || '';
}

export function formatName({
  contact,
  format,
}: {
  contact: Contact | ContactPayload;
  format: string;
}) {
  const title = format
    .split(',')
    .map((field) => field.trim())
    .map((field) => contact[field])
    .join(' ')
    .trim();

  return title || getContactTitle(contact);
}

export function getFirstLetter(string: string, defaultLetter: string) {
  let firstLetter = defaultLetter;
  if (string) {
    firstLetter = asciify(string.substr(0, 1).toLowerCase());
  }

  if (!/^[a-z]$/.test(firstLetter)) {
    firstLetter = defaultLetter;
  }

  return firstLetter;
}
