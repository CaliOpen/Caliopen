import { Contact } from 'src/modules/contact/types';
import data from './data.json';

const contactBase: Contact = data[0];
export function generateContact(props: Partial<Contact>): Contact {
  return {
    ...contactBase,
    ...props,
  };
}
