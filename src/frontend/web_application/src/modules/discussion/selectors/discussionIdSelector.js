export const discussionIdSelector = (state, { discussionId }) => {
  if (!discussionId) {
    throw new Error(
      'discussionId must be passed when calling discussionIdSelector, e.g discussionIdSelector(state, { discussionId })'
    );
  }

  return discussionId;
};
