import intersection from 'lodash.intersection';

export const getTagNamesInCommon = (messages, { strict = false } = {}) =>
  intersection(...(strict ? messages : messages
    // when not strict, this ignore messages with no tags, E.g I need to delete one tag in common
    // for a large selection which include messages with no tags
    .filter(message => message.tags)).map(message => message.tags));
