import { i18nMark, withI18nProps } from '@lingui/react';
import { TagCommon } from '../../types';

export const TAG_IMPORTANT = 'IMPORTANT';
export const TAG_INBOX = 'INBOX';
export const TAG_SPAM = 'SPAM';

const SYSTEM_TAGS = {
  [TAG_IMPORTANT]: i18nMark('tags.label.important'),
  [TAG_INBOX]: i18nMark('tags.label.inbox'),
  [TAG_SPAM]: i18nMark('tags.label.spam'),
};

export const getCleanedTagCollection = (tags: TagCommon[], names: string[]) =>
  tags.filter((tag) => names.includes(tag.name));

export const getTag = (tags: TagCommon[], name: string) =>
  tags.find((item) => item.name === name);

export const getTagLabel = (i18n: withI18nProps['i18n'], tag: TagCommon) => {
  if (!tag.label) {
    return SYSTEM_TAGS[tag.name]
      ? i18n._(SYSTEM_TAGS[tag.name], undefined, { defaults: tag.name })
      : tag.name;
  }

  return tag.label;
};

export const getTagLabelFromName = (
  i18n: withI18nProps['i18n'],
  tags: TagCommon[],
  name: string
) => {
  const tag = getTag(tags, name);

  if (!tag) {
    return name;
  }

  return getTagLabel(i18n, tag);
};
