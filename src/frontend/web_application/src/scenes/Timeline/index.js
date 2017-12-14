import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslator } from '@gandi/react-translate';
import { withUser } from '../../hoc/user';
import Presenter from './presenter';
import { requestMessages, loadMore, hasMore } from '../../store/modules/message';

const timelineSelector = state => state.message.messagesCollections.timeline && state.message.messagesCollections.timeline['0'];
const messagesSelector = state => state.message.messagesById;

const mapStateToProps = createSelector(
  [timelineSelector, messagesSelector],
  (timeline, messagesById) => ({
    messages: timeline && timeline.messages.map(id => messagesById[id])
      .sort((a, b) => new Date(b.date_insert) - new Date(a.date_insert)),
    hasMore: timeline && hasMore(timeline),
    isFetching: timeline && timeline.isFetching,
    didInvalidate: timeline && timeline.didInvalidate,
  })
);
const mapDispatchToProps = dispatch => bindActionCreators({
  requestMessages: requestMessages.bind(null, 'timeline', '0'),
  loadMore: loadMore.bind(null, 'timeline', '0'),
}, dispatch);

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withUser(),
  withTranslator()
)(Presenter);
