import getClient from 'src/services/api-client';
import calcObjectForPatch from 'src/services/api-patch';
import { Contact, ContactPayload } from './types';

const client = getClient();

// XXX: refactor
interface QueryConfig {
  url: string;
  queryKey: string[] | string;
}

export const getConfigOne = (contactId: string): QueryConfig => ({
  url: `/api/v2/contacts/${contactId}`,
  queryKey: ['contact', contactId],
});

export async function getContact(contactId: string): Promise<Contact> {
  const { data } = await client.get(getConfigOne(contactId).url);

  return data;
}

export async function updateContact({
  value,
  original,
}: {
  value: ContactPayload;
  original: Contact;
}): Promise<unknown> {
  const payload = calcObjectForPatch(value, original);

  const { data } = await client.patch(
    getConfigOne(value.contact_id).url,
    payload
  );

  return data;
}
