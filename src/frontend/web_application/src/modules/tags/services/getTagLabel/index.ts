import { I18n } from '@lingui/core';
import { TagPayload } from '../../types';

export const TAG_IMPORTANT = 'IMPORTANT';
export const TAG_INBOX = 'INBOX';
export const TAG_SPAM = 'SPAM';

export const getCleanedTagCollection = (
  tags: TagPayload[],
  namesOrLabels: string[]
): TagPayload[] =>
  tags.filter(
    (tag) =>
      namesOrLabels.includes(tag.name) || namesOrLabels.includes(tag.label)
  );

export const getTag = (
  tags: TagPayload[],
  name: string
): TagPayload | undefined => tags.find((item) => item.name === name);

export const getTagLabel = (i18n: I18n, tag: TagPayload): string => {
  if (!tag.label) {
    switch (tag.name) {
      case TAG_IMPORTANT:
        return i18n._(/* i18n */ 'tags.label.important', undefined, {
          message: tag.name,
        });
      case TAG_INBOX:
        return i18n._(/* i18n */ 'tags.label.inbox', undefined, {
          message: tag.name,
        });
      case TAG_SPAM:
        return i18n._(/* i18n */ 'tags.label.spam', undefined, {
          message: tag.name,
        });
      default:
        return tag.name;
    }
  }

  return tag.label;
};

export const getTagLabelFromName = (
  i18n: I18n,
  tags: TagPayload[],
  name: string
): string => {
  const tag = getTag(tags, name);

  if (!tag) {
    return name;
  }

  return getTagLabel(i18n, tag);
};
