import { getCleanedTagCollection } from 'src/modules/tags';
import {
  createMissingTags,
  getConfigList,
  getTagList,
  TagMixed,
  updateTagCollection,
} from 'src/modules/tags/query';
import { useLingui } from '@lingui/react';
import { I18n } from '@lingui/core';
import { Contact } from 'src/modules/contact/types';
import { QueryClient, useMutation, useQueryClient } from 'react-query';
import {
  getAllContactCollection,
  getConfigList as getContactConfigList,
} from 'src/modules/contact/query';
import { flatten } from 'lodash';

const contactsQueryKeys = getContactConfigList().queryKeys;

export const updateContactTagsConcrete = async (
  i18n: I18n,
  queryClient: QueryClient,
  contactIds: string[],
  tags: TagMixed[]
) => {
  const contactsPromise = queryClient.fetchQuery(
    contactsQueryKeys,
    getAllContactCollection
  );
  await createMissingTags(i18n, queryClient, tags);
  const { queryKeys } = getConfigList();
  const {
    data: { tags: userTags },
  } = await queryClient.fetchQuery(queryKeys, getTagList, {
    staleTime: 300000, // 5min same as `useTags`
  });

  const cleanTags = getCleanedTagCollection(
    userTags,
    tags.map((tag) => tag.name || tag.label)
  );

  const allPages = await contactsPromise;
  const contactCollection = flatten(
    allPages.map((response) => response.data.contacts)
  );
  // @ts-ignore: boolean filter not handled by ts
  const contacts: Contact[] = contactIds
    .map((id) =>
      contactCollection?.find((contact) => contact.contact_id === id)
    )
    .filter(Boolean);

  await Promise.all(
    contacts.map((contact) =>
      updateTagCollection(i18n, queryClient, {
        type: 'contact',
        entity: contact,
        tags: cleanTags,
      })
    )
  );
};

export function useUpdateContactsTags() {
  const { i18n } = useLingui();
  const queryClient = useQueryClient();

  return useMutation<
    any,
    unknown,
    { contactIds: Contact['contact_id'][]; tags: TagMixed[] }
  >(({ contactIds, tags }) =>
    updateContactTagsConcrete(i18n, queryClient, contactIds, tags)
  );
}
