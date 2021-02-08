import { createSelector } from 'reselect';
// prevent circular reference draftMessage.requestDraft > message.getDraft >
// discussion.discussionDraftSelector > message.sortMessages
import { sortMessages } from '../../message/services/sortMessages';
import { createMessageCollectionStateSelector } from '../../../store/selectors/message';
import { discussionIdSelector } from './discussionIdSelector';

const messageCollectionSelector = createMessageCollectionStateSelector(
  () => 'discussion',
  discussionIdSelector
);

export const discussionDraftSelector = (state, { discussionId }) =>
  createSelector([messageCollectionSelector], ({ messages }) => {
    const [draft] = sortMessages(messages, true).filter(
      (message) => message.is_draft === true
    );

    return draft;
  })(state, { discussionId });
