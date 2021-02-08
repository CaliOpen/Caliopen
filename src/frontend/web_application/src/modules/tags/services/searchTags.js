import { getTagLabel } from './getTagLabel';

export const searchTags = (i18n, userTags, terms) =>
  new Promise((resolve) => {
    if (!terms.length) {
      resolve([]);

      return;
    }

    const findTags = (tags) =>
      tags.filter((tag) =>
        getTagLabel(i18n, tag).toLowerCase().startsWith(terms.toLowerCase())
      );

    resolve(findTags(userTags));
  });
