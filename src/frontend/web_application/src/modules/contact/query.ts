import getClient from 'src/services/api-client';
import calcObjectForPatch from 'src/services/api-patch';
import { Contact, ContactPayload } from './types';

const client = getClient();

// XXX: refactor
interface QueryConfig {
  url: string;
  queryKey: string[] | string;
}

export interface PostContactSuccess {
  location: string;
  contact_id: string;
}

export const getConfigNew = (): QueryConfig => ({
  url: `/api/v2/contacts`,
  queryKey: ['contact', 'new'],
});

export const getConfigOne = (contactId: string): QueryConfig => ({
  url: `/api/v2/contacts/${contactId}`,
  queryKey: ['contact', contactId],
});

export const getConfigDelete = (contactId?: string): QueryConfig => ({
  url: `/api/v2/contacts/${contactId}`,
  queryKey: ['contact'],
});

export async function getContact(contactId: string): Promise<Contact> {
  const { data } = await client.get(getConfigOne(contactId).url);

  return data;
}

export async function createContact({
  value: payload,
}: {
  value: ContactPayload;
}): Promise<PostContactSuccess> {
  const { data } = await client.post(getConfigNew().url, payload);

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
    getConfigOne(original.contact_id).url,
    payload
  );

  return data;
}

export async function deleteContact(contactId) {
  const { data } = await client.delete(getConfigDelete(contactId).url);

  return data;
}
