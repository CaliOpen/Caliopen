import { createSelector } from 'reselect';
import { compose, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  requestDiscussions,
  hasMore,
  loadMoreDiscussions,
  filterImportance,
} from '../../store/modules/discussion';
import { UserSelector } from '../../store/selectors/user';
import { getUser } from '../../modules/user/actions/getUser';
import { withContacts } from '../../modules/contact';

import Presenter from './presenter';

const discussionStateSelector = (state) => state.discussion;

const mapStateToProps = createSelector(
  [discussionStateSelector, UserSelector],
  (discussionState, userState) => ({
    discussions: discussionState.discussions
      .map((id) => discussionState.discussionsById[id])
      .filter(
        (discussion) =>
          discussion.importance_level >= discussionState.importanceRange.min &&
          discussion.importance_level <= discussionState.importanceRange.max
      )
      .sort((a, b) => new Date(b.date_update) - new Date(a.date_update)),
    hasMore: discussionState && hasMore(discussionState),
    isFetching: discussionState.isFetching,
    didInvalidate: discussionState.didInvalidate,
    importanceRange: discussionState.importanceRange,
    isUserFetching: userState.isFetching,
    user: userState.user,
  })
);

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      requestDiscussions,
      loadMore: loadMoreDiscussions,
      getUser,
      filterImportance,
      // deleteDiscussion: onDeleteMessage,
      // updateMessagesTags,
    },
    dispatch
  );

export default compose(
  // this initialize contacts for Participant rendering
  withContacts(),
  connect(mapStateToProps, mapDispatchToProps)
)(Presenter);
