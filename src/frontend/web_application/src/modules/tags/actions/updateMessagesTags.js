import throttle from 'lodash.throttle';
import JsSHA from 'jssha';
import { updateTagCollection } from './updateTagCollection';
import { getTagNamesInCommon } from '../services/getTagNamesInCommon';
import { getCleanedTagCollection } from '../services/getTagLabel';
import { invalidateAll } from '../../../store/modules/message';

const UPDATE_WAIT_TIME = 2 * 1000;

const updateMessagesTagsConcrete = (i18n, messageIds, tags) => async (
  dispatch,
  getState
) => {
  const {
    message: { messagesById },
    tag: { tags: userTags },
  } = getState();
  const messages = messageIds.map((id) => messagesById[id]);
  const tagNamesInCommon = getTagNamesInCommon(messages);
  const tagsInCommon = getCleanedTagCollection(userTags, tagNamesInCommon);

  const deletedTags = tagsInCommon.filter((tag) => !new Set(tags).has(tag));
  const createdTags = tags.filter((tag) => !new Set(tagsInCommon).has(tag));

  const updateTagsColl = (message) => {
    const tagsToSave = (message.tags
      ? getCleanedTagCollection(userTags, message.tags)
      : []
    )
      .filter((tag) => !new Set(deletedTags).has(tag))
      .concat(createdTags);

    return tagsToSave;
  };

  try {
    // extract the first message and make sure if there is a brand new tag is fully saved and synced
    // before updating all other messages: it prevents to try to POST a new tag for each messages
    const firstMessage = messages.shift();

    await dispatch(
      updateTagCollection(i18n, {
        type: 'message',
        entity: firstMessage,
        tags: updateTagsColl(firstMessage),
        lazy: true,
      })
    );
    await Promise.all(
      messages.map((message) =>
        dispatch(
          updateTagCollection(i18n, {
            type: 'message',
            entity: message,
            tags: updateTagsColl(message),
            lazy: true,
          })
        )
      )
    );

    return dispatch(invalidateAll());
  } catch (e) {
    dispatch(invalidateAll());

    return Promise.reject(e);
  }
};

const createThrottled = (
  resolve,
  reject,
  dispatch,
  { i18n, messageIds, tags }
) =>
  throttle(
    async () => {
      try {
        resolve(
          await dispatch(updateMessagesTagsConcrete(i18n, messageIds, tags))
        );
      } catch (err) {
        reject(err);
      }
    },
    UPDATE_WAIT_TIME,
    { leading: false }
  );

const throttleds = {};
const sha1 = new JsSHA('SHA-1', 'TEXT');
const getThrottleHash = (messageIds) =>
  messageIds
    .sort()
    .reduce((sha, messageId) => {
      sha.update(messageId);

      return sha;
    }, sha1)
    .getHash('HEX');

export const updateMessagesTags = (
  i18n,
  messageIds,
  tags,
  { withThrottle = true } = {}
) => (dispatch) =>
  new Promise(async (resolve, reject) => {
    const hash = getThrottleHash(messageIds);

    if (throttleds[hash]) {
      throttleds[hash].cancel();
    }

    if (!withThrottle) {
      try {
        const messageUpToDate = await dispatch(
          updateMessagesTagsConcrete(i18n, messageIds, tags)
        );
        resolve(messageUpToDate);
      } catch (err) {
        reject(err);
      }

      return;
    }

    throttleds[hash] = createThrottled(resolve, reject, dispatch, {
      i18n,
      messageIds,
      tags,
    });
    throttleds[hash]();
  });
