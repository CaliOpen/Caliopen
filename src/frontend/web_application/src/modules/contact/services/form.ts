import { ContactFormData } from '../types';

export const getNewContact = (): ContactFormData => ({
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
