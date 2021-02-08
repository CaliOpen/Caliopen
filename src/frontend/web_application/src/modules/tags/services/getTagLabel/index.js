import { i18nMark } from '@lingui/react';

export const TAG_IMPORTANT = 'IMPORTANT';
export const TAG_INBOX = 'INBOX';
export const TAG_SPAM = 'SPAM';

const SYSTEM_TAGS = {
  [TAG_IMPORTANT]: i18nMark('tags.label.important'),
  [TAG_INBOX]: i18nMark('tags.label.inbox'),
  [TAG_SPAM]: i18nMark('tags.label.spam'),
};

export const getCleanedTagCollection = (tags, names) =>
  tags.filter((tag) => names.includes(tag.name));

export const getTag = (tags, name) => tags.find((item) => item.name === name);

export const getTagLabel = (i18n, tag) => {
  if (!tag.label) {
    return SYSTEM_TAGS[tag.name]
      ? i18n._(SYSTEM_TAGS[tag.name], null, { defaults: tag.name })
      : tag.name;
  }

  return tag.label;
};

export const getTagLabelFromName = (i18n, tags, name) => {
  const tag = getTag(tags, name);

  if (!tag) {
    return name;
  }

  return getTagLabel(i18n, tag);
};
