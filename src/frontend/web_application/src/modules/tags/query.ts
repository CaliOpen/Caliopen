import { I18n } from '@lingui/core';
import { isEqual } from 'lodash';
import { QueryClient, QueryKey } from 'react-query';
import getClient from 'src/services/api-client';
import {
  updateTags as updateContactTags,
  getQueryKeys as getContactQueryKeys,
} from 'src/modules/contact/query';
import {
  updateTags as updateMessageTags,
  getQueryKeys as getMessageQueryKeys,
} from 'src/modules/message/query';
import {
  updateTags as updateDiscussionTags,
  getQueryKeys as getDiscussionQueryKeys,
} from 'src/modules/discussion/query';
import calcObjectForPatch from 'src/services/api-patch';
import { MutateConfig, QueryConfig } from 'src/types';
import { getTagLabel } from './services/getTagLabel';
import {
  Entity,
  EntityType,
  NewTag,
  TagAPIGetList,
  TagAPIPost,
  TagPayload,
} from './types';

const client = getClient();

// CONFIGS

export const getQueryKeys = ({
  fetchParams,
}: {
  fetchParams?: any;
} = {}): QueryKey =>
  ['tags', fetchParams ? JSON.stringify(fetchParams) : undefined].filter(
    Boolean
  );

export const getConfigList = (): QueryConfig => ({
  url: `/api/v2/tags`,
  queryKeys: 'tags',
});

export const getConfigNew = (): MutateConfig => ({
  url: `/api/v2/tags`,
});

export const getConfigUpdate = (tag: TagPayload): MutateConfig => ({
  url: `/api/v2/tags/${tag.name}`,
});

export const getConfigDelete = (tag: TagPayload): MutateConfig => ({
  url: `/api/v2/tags/${tag.name}`,
});
// -------

// QUERIES

export function getTagList() {
  return client.get<TagAPIGetList['response']>(getConfigList().url);
}

// MUTATIONS

// --- Basic

export const createTag = (tag: NewTag) => {
  const payload: TagAPIPost['parameters']['body'] = tag;

  return client.post(getConfigNew().url, payload);
};

export const updateTag = ({
  value,
  original,
}: {
  value: TagPayload;
  original: TagPayload;
}) => {
  const payload = calcObjectForPatch(value, original);

  return client.patch(getConfigUpdate(original).url, payload);
};

export const deleteTag = (tag: TagPayload) =>
  client.delete(getConfigDelete(tag).url);

// --- Entities

type UpdateAction = (entity: Entity, tags: TagPayload[]) => Promise<any>;
const getUpdateAction = (type: EntityType): UpdateAction => {
  switch (type) {
    case 'discussion':
      return updateDiscussionTags;
    case 'message':
      return updateMessageTags;
    case 'contact':
      return updateContactTags;
    default:
      throw new Error(`Entity ${type} not supported`);
  }
};

const getQueryKeyAction = (type: EntityType): ((...any) => QueryKey) => {
  switch (type) {
    case 'discussion':
      return getDiscussionQueryKeys;
    case 'message':
      return getMessageQueryKeys;
    case 'contact':
      return getContactQueryKeys;
    default:
      throw new Error(`Entity ${type} not supported`);
  }
};
export const updateEntityTags = (
  type: EntityType,
  entity: Entity,
  tags: TagPayload[]
) => {
  const action = getUpdateAction(type);

  return action(entity, tags);
};

const computeNewTags = (
  i18n: I18n,
  knownTags: TagPayload[],
  tagCollection: TagMixed[]
) => {
  const knownLabels = knownTags.map((tag) =>
    getTagLabel(i18n, tag).toLowerCase()
  );
  const newTags: NewTag[] = tagCollection
    .filter((tag) => !tag.name)
    .filter((tag: NewTag) => !knownLabels.includes(tag.label.toLowerCase()));

  return newTags;
};

export const createMissingTags = async (
  i18n: I18n,
  queryClient: QueryClient,
  tagCollection: TagMixed[]
) => {
  const { queryKeys } = getConfigList();
  const knownTags = await queryClient.fetchQuery(queryKeys, getTagList, {
    staleTime: 300000, // 5min
  });

  const newTags = computeNewTags(i18n, knownTags.data.tags, tagCollection);

  if (newTags.length === 0) {
    return;
  }

  await Promise.all(newTags.map((tag) => createTag(tag)));
  queryClient.invalidateQueries(queryKeys);
};

const getTagFromLabel = (i18n: I18n, tags: TagPayload[], label: string) =>
  tags.find(
    (tag) => getTagLabel(i18n, tag).toLowerCase() === label.toLowerCase()
  );

// unable to refined `(TagPayload | Newtag)` type.
export type TagMixed = Partial<TagPayload> & NewTag;

export const updateTagCollection = async (
  i18n: I18n,
  queryClient: QueryClient,
  {
    type,
    entity,
    tags: tagCollection,
  }: {
    type: EntityType;
    entity: Entity;
    tags: TagMixed[];
  }
) => {
  await createMissingTags(i18n, queryClient, tagCollection);
  const { queryKeys } = getConfigList();
  const {
    data: { tags: upToDateTags },
  } = await queryClient.fetchQuery(queryKeys, getTagList, {
    staleTime: 300000, // 5min, same as `useTags`
  });

  // @ts-ignore: Boolean filter does not help
  const normalizedTags: TagPayload[] = tagCollection
    .map((tag) =>
      !tag.name ? getTagFromLabel(i18n, upToDateTags, tag.label) : tag
    )
    .filter(Boolean);

  const tagNames = normalizedTags.map((tag) => tag.name);
  if (!isEqual(entity.tags, tagNames)) {
    await updateEntityTags(type, entity, normalizedTags);

    const entityQueryKeys = getQueryKeyAction(type);

    // invalidate entity & collection
    queryClient.invalidateQueries(entityQueryKeys());
  }
};

// ------------------
