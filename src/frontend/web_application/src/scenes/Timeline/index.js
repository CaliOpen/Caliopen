import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withI18n } from 'lingui-react';
import Presenter from './presenter';
import { filterTimeline } from '../../store/actions/timeline';
import { replyToMessage, loadMore, hasMore } from '../../store/modules/message';
import { updateMessagesTags, withTags } from '../../modules/tags';
import { deleteMessage } from '../../modules/message';
import { clearDraft } from '../../store/modules/draft-message';
import { timelineFilterSelector } from '../../store/selectors/timeline';
import { UserSelector } from '../../store/selectors/user';

const timelineSelector = createSelector([
  state => state.message.messagesCollections.timeline,
  timelineFilterSelector,
], (collection, timelineFilter) => collection && collection[timelineFilter]);
const messagesSelector = state => state.message.messagesById;

const onDeleteMessage = ({ message }) => dispatch =>
  dispatch(deleteMessage({ message }))
    .then(() => {
      if (!message.is_draft) {
        return undefined;
      }

      return dispatch(clearDraft({ internalId: message.discussion_id }));
    });

const mapStateToProps = createSelector(
  [timelineSelector, messagesSelector, timelineFilterSelector, UserSelector],
  (timeline, messagesById, timelineFilter, userState) => ({
    messages: timeline && timeline.messages.map(id => messagesById[id]),
    hasMore: timeline && hasMore(timeline),
    isFetching: timeline && timeline.isFetching,
    didInvalidate: timeline && timeline.didInvalidate,
    timelineFilter,
    user: userState.user,
  })
);
const mapDispatchToProps = dispatch => bindActionCreators({
  requestMessages: filterTimeline,
  loadMore: loadMore.bind(null, 'timeline'),
  replyToMessage,
  deleteMessage: onDeleteMessage,
  updateMessagesTags,
}, dispatch);

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withI18n(),
  withTags(),
)(Presenter);
