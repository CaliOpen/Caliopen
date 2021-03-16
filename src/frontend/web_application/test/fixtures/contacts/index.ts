import data from './data.json';
import { ContactPayload } from 'src/modules/contact/types';

const contactBase: ContactPayload = data[0];
export function generateContact(
  props: Partial<ContactPayload>
): ContactPayload {
  return {
    ...contactBase,
    ...props,
  };
}
