import React, { Component, PropTypes } from 'react';
import { withTranslator } from '@gandi/react-translate';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';
import BlockList from '../../components/BlockList';
import DiscussionItem from './components/DiscussionItem';
import './style.scss';

// XXX: load data from store
// - dispatch fetch list

// import { createSelector } from 'reselect';
// import { hasMore } from '../../reducer/thread-reducer.js';
//
// const threadsSelector = createSelector(
//   state => state.threadReducer,
//   payload => ({
//     hasMore: hasMore(payload),
//     threads: payload.threads.map(threadId => payload.threadsById[threadId]),
//     isFetching: payload.isFetching,
//   })
// );

// this.$ngRedux.dispatch(this.DiscussionsActions.fetchThreads());

@withTranslator()
class Discussions extends Component {
  static propTypes = {
    __: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      discussions: [],
      isFetching: true,
      hasMore: true,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.loadThreads();
    }, 2000);
  }

  loadThreads() {
    this.setState({
      /* eslint-disable */
      discussions: [
        {"thread": {"tags": [{ tag_id: 'foo-bar-1', name: 'robot'}, { tag_id: 'foo-bar-2', name: 'work'}], "text": "<p>It's okay, Bender. I like cooking too. You, minion. Lift my arm. AFTER H=\r\nIM! I don't know what you did, Fry, but once again, you screwed up! Now all\r\nthe planets are gonna start cracking wise abo", "date_update": null, "privacy_index": 1, "contacts": [{"type": "to", "contact_id": "1039cdcc-1f6f-4b5d-9c8a-5d7c711f357f", "address": "test@caliopen.local"}, {"type": "from", "contact_id": "0ba2e346-e4f8-4c45-9adc-eeb1d42f07e0", "address": "zoidberg@caliopen.local"}], "date_insert": "2016-05-09T15:01:42.588000", "thread_id": "cd53e13a-267d-4d9c-97ee-d0fc59c64200", "total_count": 1, "attachment_count": 0, "importance_level": 0, "unread_count": 1}},
        {"thread": {"tags": [{ tag_id: 'foo-bar-3', name: 'best quotes'}, { tag_id: 'foo-bar-4', name: 'lolilol'}], "text": "Shut up and take my money! Leela, are you alright? You got wanged on the he=\r\nad. Bender, you risked your life to save me! Spare me your space age techno=\r\nbabble, Attila the Hun! Now that the, uh, ga", "date_update": null, "privacy_index": 25, "contacts": [{"type": "to", "contact_id": "1039cdcc-1f6f-4b5d-9c8a-5d7c711f357f", "address": "test@caliopen.local"}, {"type": "from", "contact_id": "0ba2e346-e4f8-4c45-9adc-eeb1d42f07e0", "address": "zoidberg@caliopen.local"}], "date_insert": "2016-05-09T15:01:42.489000", "thread_id": "46d30c27-6cd8-407b-8536-fda4196c20ca", "total_count": 2, "attachment_count": 0, "importance_level": 0, "unread_count": 2}},
      ]
      /* eslint-enable */
    });
    this.setState({ isFetching: false });
  }

  loadMore() {
    this.$ngRedux.dispatch(this.DiscussionsActions.loadMoreThreads());
  }

  render() {
    const { __ } = this.props;

    return (
      <div>
        <Spinner isLoading={this.state.isFetching} />
        <BlockList
          className="s-discussion-list"
          infinite-scroll="$ctrl.loadMore()"
        >
          {this.state.discussions.map(item => (
            <DiscussionItem key={item.thread.thread_id} discussion={item.thread} />
          ))}
        </BlockList>
        {this.state.hasMore && (
          <div className="s-discussion-list__load-more">
            <Button hollow>{__('general.action.load_more')}</Button>
          </div>
        )}
      </div>
    );
  }
}

export default Discussions;
