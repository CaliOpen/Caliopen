export const draftSelector = (state, { internalId }) =>
  state.draftMessage.draftsByInternalId[internalId];
