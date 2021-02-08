import { selectKeys } from '../../selectors/publicKey';

const intersect = (arr1, arr2) => arr1.some((value) => arr2.includes(value));

// XXX: refactor as a redux selector: const keysSelector = (state, { contactIds }) => {};
export const getStoredKeys = (state, contactIds) => {
  const missingKeysContactIds = [];
  const cachedKeys = contactIds.reduce((acc, contactId) => {
    const keys = selectKeys(state, contactId);

    if (!(keys && keys.length > 0)) {
      missingKeysContactIds.push(contactId);

      return acc;
    }

    return [...acc, ...keys];
  }, []);

  return { keys: cachedKeys, missingKeysContactIds };
};

export const filterKeysByAddress = (keys, addresses) =>
  keys.filter(({ emails }) => intersect(emails, addresses));

export const checkEachAddressHasKey = (addresses, keys) =>
  addresses.every((address) =>
    keys.some(({ emails }) => emails.includes(address))
  );
