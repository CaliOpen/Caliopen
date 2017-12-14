import React, { Component } from 'react';
import PropTypes from 'prop-types';
import throttle from 'lodash.throttle';
import Spinner from '../../components/Spinner';
import PageTitle from '../../components/PageTitle';
import Button from '../../components/Button';
import BlockList from '../../components/BlockList';
import InfiniteScroll from '../../components/InfiniteScroll';
import MenuBar from '../../components/MenuBar';
import MessageItem from './components/MessageItem';
import { isMessageFromUser } from '../../services/message';

import './style.scss';

const LOAD_MORE_THROTTLE = 1000;

class Timeline extends Component {
  static propTypes = {
    user: PropTypes.shape({}),
    requestMessages: PropTypes.func.isRequired,
    loadMore: PropTypes.func.isRequired,
    messages: PropTypes.arrayOf(PropTypes.shape({})),
    isFetching: PropTypes.bool,
    didInvalidate: PropTypes.bool,
    hasMore: PropTypes.bool,
    __: PropTypes.func.isRequired,
  };

  static defaultProps = {
    messages: [],
    user: undefined,
    isFetching: false,
    didInvalidate: false,
    hasMore: false,
  };
  state = {};

  componentDidMount() {
    this.props.requestMessages();

    this.throttledLoadMore = throttle(
      () => this.props.loadMore(),
      LOAD_MORE_THROTTLE,
      { trailing: false }
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.didInvalidate && !nextProps.isFetching) {
      this.props.requestMessages();
    }
  }

  loadMore = () => {
    if (this.props.hasMore) {
      this.throttledLoadMore();
    }
  }

  render() {
    const { user, messages, isFetching, hasMore, __ } = this.props;

    return (
      <div className="s-timeline">
        <PageTitle title={__('header.menu.discussions')} />
        <MenuBar className="s-timeline__menu-bar">
          <Spinner isLoading={isFetching} className="s-timeline__spinner" />
        </MenuBar>
        <InfiniteScroll onReachBottom={this.loadMore}>
          <BlockList className="s-timeline__list">
            {messages.map(message => (
              <MessageItem
                key={message.message_id}
                isMessageFromUser={(user && isMessageFromUser(message, user)) || false}
                message={message}
              />
            ))}
          </BlockList>
        </InfiniteScroll>
        {hasMore && (
          <div className="s-timeline__load-more">
            <Button shape="hollow" onClick={this.loadMore}>{__('general.action.load_more')}</Button>
          </div>
        )}
      </div>
    );
  }
}

export default Timeline;
