import isEqual from 'lodash.isequal';
import {
  requestMessage,
  updateTags as updateMessageTags,
} from '../../../../store/modules/message';
import {
  requestContact,
  updateTags as updateContactTags,
} from 'src/modules/contact/store/reducer';
import { tryCatchAxiosPromise } from '../../../../services/api-client';
import { getTagLabel } from '../../services/getTagLabel';
import { tagsApi } from '../../store';
import { AppDispatch } from 'src/types';
import { TagCommon } from '../../types';

const getUpdateAction = (type) => {
  switch (type) {
    case 'message':
      return updateMessageTags;
    case 'contact':
      return updateContactTags;
    default:
      throw new Error(`Entity ${type} not supported`);
  }
};

export const updateTags = (type, entity, { tags }) => (dispatch) => {
  const action = getUpdateAction(type);

  // @ts-ignore: cf. store typing
  return tryCatchAxiosPromise(dispatch(action({ [type]: entity, tags })));
};

const getTagFromLabel = (i18n, tags, label) =>
  tags.find(
    (tag) => getTagLabel(i18n, tag).toLowerCase() === label.toLowerCase()
  );

const createMissingTags = (i18n, tagCollection: TagCommon[]) => async (
  dispatch: AppDispatch,
  getState
) => {
  // @ts-ignore: cf. reducer typing
  const { data: { tags: userTags } = { tags: [] } } = await dispatch(
    // @ts-ignore: cf.axios-middleware typing
    tagsApi.endpoints.getTags.initiate()
  );

  const knownLabels = userTags.map((tag) =>
    getTagLabel(i18n, tag).toLowerCase()
  );
  const newTags = tagCollection
    .filter((tag) => !tag.name)
    .filter(
      (tag) => !knownLabels.includes(getTagLabel(i18n, tag).toLowerCase())
    );

  if (!newTags.length) {
    return userTags;
  }

  await Promise.all(
    // @ts-ignore: cf.axios-middleware typing
    newTags.map((tag) => dispatch(tagsApi.endpoints.createTag.initiate(tag)))
  );

  // @ts-ignore: cf.axios-middleware typing
  return dispatch(tagsApi.endpoints.getTags.initiate());
};

const getRequestEntityAct = (type) => {
  switch (type) {
    case 'message':
      return requestMessage;
    case 'contact':
      return requestContact;
    default:
      throw new Error(`Entity ${type} not supported`);
  }
};

export const updateTagCollection = (
  i18n,
  { type, entity, tags: tagCollection, lazy = false }
) => async (dispatch: AppDispatch) => {
  // @ts-ignore: cf.axios-middleware typing
  await dispatch(createMissingTags(i18n, tagCollection));
  // @ts-ignore: cf. reducer typing
  const { data: { tags: upToDateTags } = { tags: [] } } = await dispatch(
    // @ts-ignore: cf.axios-middleware typing
    tagsApi.endpoints.getTags.initiate()
  );

  const normalizedTags = tagCollection.reduce(
    (acc, tag) => [
      ...acc,
      !tag.name ? getTagFromLabel(i18n, upToDateTags, tag.label) : tag,
    ],
    []
  );
  const tagNames = normalizedTags.map((tag) => tag.name);
  if (
    !isEqual(
      entity.tags,
      tagCollection.map((tag) => tag.name)
    )
  ) {
    await dispatch(
      // @ts-ignore: cf.axios-middleware typing
      updateTags(type, entity, {
        tags: tagNames,
      })
    );
    if (lazy) {
      return {
        ...entity,
        tags: tagNames,
      };
    }
    const request = getRequestEntityAct(type);
    return tryCatchAxiosPromise(dispatch(request(entity[`${type}_id`])));
  }
  return entity;
};
