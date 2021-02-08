import throttle from 'lodash.throttle';
import JsSHA from 'jssha';
import { updateTagCollection } from './updateTagCollection';
import { getTagNamesInCommon } from '../services/getTagNamesInCommon';
import { getCleanedTagCollection } from '../services/getTagLabel';
import { invalidate } from '../../../store/modules/contact';

const UPDATE_WAIT_TIME = 2 * 1000;

const updateContactTagsConcrete = (i18n, contactIds, tags) => async (
  dispatch,
  getState
) => {
  const {
    contact: { contactsById },
    tag: { tags: userTags },
  } = getState();
  const contacts = contactIds.map((id) => contactsById[id]);
  const tagNamesInCommon = getTagNamesInCommon(contacts);
  const tagsInCommon = getCleanedTagCollection(userTags, tagNamesInCommon);

  const deletedTags = tagsInCommon.filter((tag) => !new Set(tags).has(tag));
  const createdTags = tags.filter((tag) => !new Set(tagsInCommon).has(tag));

  const updateTagsColl = (contact) => {
    const tagsToSave = (contact.tags
      ? getCleanedTagCollection(userTags, contact.tags)
      : []
    )
      .filter((tag) => !new Set(deletedTags).has(tag))
      .concat(createdTags);

    return tagsToSave;
  };

  try {
    // extract the first contact and make sure if there is a brand new tag is fully saved and synced
    // before updating all other contacts: it prevents to try to POST a new tag for each contacts
    const firstContact = contacts.shift();

    await dispatch(
      updateTagCollection(i18n, {
        type: 'contact',
        entity: firstContact,
        tags: updateTagsColl(firstContact),
        lazy: true,
      })
    );
    await Promise.all(
      contacts.map((contact) =>
        dispatch(
          updateTagCollection(i18n, {
            type: 'contact',
            entity: contact,
            tags: updateTagsColl(contact),
            lazy: true,
          })
        )
      )
    );

    return dispatch(invalidate());
  } catch (e) {
    dispatch(invalidate());

    return Promise.reject(e);
  }
};

const createThrottled = (
  resolve,
  reject,
  dispatch,
  { i18n, contactIds, tags }
) =>
  throttle(
    async () => {
      try {
        resolve(
          await dispatch(updateContactTagsConcrete(i18n, contactIds, tags))
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
const getThrottleHash = (contactIds) =>
  contactIds
    .sort()
    .reduce((sha, contactId) => {
      sha.update(contactId);

      return sha;
    }, sha1)
    .getHash('HEX');

export const updateContactTags = (
  i18n,
  contactIds,
  tags,
  { withThrottle = true } = {}
) => (dispatch) =>
  new Promise(async (resolve, reject) => {
    const hash = getThrottleHash(contactIds);

    if (throttleds[hash]) {
      throttleds[hash].cancel();
    }

    if (!withThrottle) {
      try {
        const results = await dispatch(
          updateContactTagsConcrete(i18n, contactIds, tags)
        );
        resolve(results);
      } catch (err) {
        reject(err);
      }

      return;
    }

    throttleds[hash] = createThrottled(resolve, reject, dispatch, {
      i18n,
      contactIds,
      tags,
    });
    throttleds[hash]();
  });
