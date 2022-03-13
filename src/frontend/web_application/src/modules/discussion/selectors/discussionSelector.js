import { getModuleStateSelector } from '../../../store/selectors/getModuleStateSelector';

export const discussionSelector = (state, { discussionId }) =>
  getModuleStateSelector('discussion')(state).discussionsById[discussionId];

export const shouldFetchSelector = (state, id) => {
  const discussion = discussionSelector(state, { discussionId: id });
  const { didInvalidate, isFetching } =
    getModuleStateSelector('discussion')(state);

  return (!discussion || didInvalidate) && !isFetching;
};
