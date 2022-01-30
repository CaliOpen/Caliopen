import getClient from 'src/services/api-client';
import { ContactPayload } from './types';

const client = getClient();

export async function getContact(contactId: string): Promise<ContactPayload> {
  const { data } = await client.get(`/api/v2/contacts/${contactId}`);

  return data;
}
