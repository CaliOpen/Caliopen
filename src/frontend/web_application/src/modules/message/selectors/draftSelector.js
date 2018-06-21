import { createSelector } from 'reselect';
import { discussionSelector } from './discussionSelector';

export const draftSelector = (state, { discussionId }) => createSelector(
  [discussionSelector],
  (messages) => {
    const [draft] = messages.filter(message => message.is_draft === true);

    return draft;
  }
)(state, { discussionId });
