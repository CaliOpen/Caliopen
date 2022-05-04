import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { flatten } from 'lodash';
import getClient from 'src/services/api-client';
import calcObjectForPatch from 'src/services/api-patch';
import { Contact, ContactPayload, GETContactListPayload } from './types';

const client = getClient();
export interface PostContactSuccess {
  location: string;
  contact_id: string;
}

type QueryKey = string[] | string;

// ------------------------
// XXX: refactor
interface FetchConfig {
  url: string;
  fetchParams?: Record<string, string | number>;
  requestConfig?: AxiosRequestConfig;
}
interface QueryConfig extends FetchConfig {
  queryKeys: string | string[];
}
export const getQueryKeys = ({
  contactId,
  fetchParams,
}: {
  contactId?: string;
  fetchParams?: any;
} = {}): QueryKey =>
  // @ts-ignore
  [
    'contacts',
    contactId,
    fetchParams ? JSON.stringify(fetchParams) : undefined,
  ].filter(Boolean);

export const getConfigOne = (contactId: string): FetchConfig => ({
  url: `/api/v2/contacts/${contactId}`,
});

export const getConfigList = (fetchParams?: any): QueryConfig => ({
  url: `/api/v2/contacts`,
  fetchParams,
  queryKeys: getQueryKeys({ fetchParams }),
});
export const getConfigNew = (): FetchConfig => ({
  url: `/api/v2/contacts`,
});
export const getConfigDelete = (contactId?: string): FetchConfig => ({
  url: `/api/v2/contacts/${contactId}`,
});

// -----------------

export function getContact(contactId: string) {
  return client.get<Contact>(getConfigOne(contactId).url);
}

export function getContactList(fetchParams) {
  return client.get<GETContactListPayload>(getConfigList().url, {
    params: fetchParams,
  });
}

const hasMore = (contacts: Contact[], total) => contacts.length < total;
const getNextOffset = (contacts: Contact[]) => contacts.length;

const getNextPageParam = (
  lastPage: AxiosResponse<GETContactListPayload>,
  allPages: AxiosResponse<GETContactListPayload>[]
) => {
  const currentContacts = flatten(allPages.map((res) => res.data.contacts));

  if (!hasMore(currentContacts, lastPage.data.total)) {
    return undefined;
  }
  return {
    offset: getNextOffset(currentContacts),
  };
};

const getContactListRecursive = async (
  fetchParams = {},
  allPages: AxiosResponse<GETContactListPayload>[] = []
): Promise<AxiosResponse<GETContactListPayload>[]> => {
  const response = await getContactList(fetchParams);
  const nextAllPages = [...allPages, response];
  const nextPageParams = getNextPageParam(response, nextAllPages);

  if (nextPageParams) {
    return getContactListRecursive(nextPageParams, nextAllPages);
  }

  return nextAllPages;
};

export function getAllContactCollection() {
  return getContactListRecursive({ limit: 1000 });
}

export function createContact({ value: payload }: { value: ContactPayload }) {
  return client.post<PostContactSuccess>(getConfigNew().url, payload);
}

export function updateContact({
  value,
  original,
}: {
  value: ContactPayload;
  original: Contact;
}) {
  const payload = calcObjectForPatch(value, original);

  return client.patch(getConfigOne(original.contact_id).url, payload);
}

export function deleteContact(contactId: string) {
  return client.delete(getConfigDelete(contactId).url);
}
