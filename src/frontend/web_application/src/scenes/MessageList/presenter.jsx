import React, { Component } from 'react';
import PropTypes from 'prop-types';
import throttle from 'lodash.throttle';
import { Trans } from 'lingui-react';
import { PageTitle, Button } from '../../components';
import MessageListBase from './components/MessageList';
import ReplyForm from './components/ReplyForm';
import ReplyExcerpt from './components/ReplyExcerpt';
import { addEventListener } from '../../services/event-manager';

const LOAD_MORE_THROTTLE = 1000;

class MessageList extends Component {
  static propTypes = {
    requestMessages: PropTypes.func.isRequired,
    discussionId: PropTypes.string.isRequired,
    messages: PropTypes.arrayOf(PropTypes.shape({})),
    push: PropTypes.func.isRequired,
    didInvalidate: PropTypes.bool.isRequired,
    isFetching: PropTypes.bool.isRequired,
    setMessageRead: PropTypes.func.isRequired,
    deleteMessage: PropTypes.func.isRequired,
    replyToMessage: PropTypes.func.isRequired,
    copyMessageTo: PropTypes.func.isRequired,
    removeTab: PropTypes.func.isRequired,
    loadMore: PropTypes.func.isRequired,
    hasMore: PropTypes.bool.isRequired,
    updateTagCollection: PropTypes.func.isRequired,
    currentTab: PropTypes.shape({}),
  };

  static defaultProps = {
    messages: [],
    currentTab: undefined,
  };

  state = {
    isDraftFocus: false,
  };

  componentDidMount() {
    const { discussionId } = this.props;
    this.props.requestMessages({ discussion_id: discussionId });

    this.throttledLoadMore = throttle(
      () => this.props.loadMore(),
      LOAD_MORE_THROTTLE,
      { trailing: false }
    );

    this.unsubscribeClickEvent = addEventListener('click', (ev) => {
      const { target } = ev;
      const testClick = (tg, node) => node === tg || node.contains(tg);

      if (
        !(this.replyFormRef && testClick(target, this.replyFormRef)) &&
        !(this.replyExcerptRef && testClick(target, this.replyExcerptRef))
      ) {
        if (this.state.isDraftFocus) {
          ev.preventDefault();
        }
        this.setState({
          isDraftFocus: false,
        });
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    const {
      didInvalidate, isFetching, messages, currentTab,
    } = nextProps;
    if (didInvalidate && !isFetching) {
      this.props.requestMessages({ discussion_id: nextProps.discussionId });
    }

    if (!didInvalidate && !isFetching && messages.length === 0) {
      this.closeTab({ currentTab });
    }
  }

  componentWillUnmount() {
    this.unsubscribeClickEvent();
  }

  closeTab({ currentTab }) {
    if (currentTab) {
      return this.props.removeTab(currentTab);
    }

    return this.props.push('/');
  }

  handleFocusDraft = () => {
    this.setState({
      isDraftFocus: true,
    });
  }

  handleSetMessageRead = ({ message }) => {
    this.props.setMessageRead({ message, isRead: true });
  };

  handleSetMessageUnread = ({ message }) => {
    this.props.setMessageRead({ message, isRead: false });
  };

  handleDeleteMessage = ({ message }) => {
    const { deleteMessage } = this.props;
    deleteMessage({ message });
  };

  handleDelete = () => {
    const { messages, deleteMessage } = this.props;
    Promise.all(messages.map(message => deleteMessage({ message })));
  };

  makeHandleReplyToMessage = internalId => ({ message }) => this.props.replyToMessage({
    message,
    internalId,
  });

  loadMore = () => {
    if (this.props.hasMore) {
      this.throttledLoadMore();
    }
  }

  renderLoadMore() {
    const { hasMore } = this.props;

    return hasMore && (
      <Button shape="hollow" onClick={this.loadMore}><Trans id="general.action.load_more">Load more</Trans></Button>
    );
  }

  render() {
    const {
      messages, discussionId, isFetching, copyMessageTo, updateTagCollection,
    } = this.props;
    const internalId = discussionId;
    const messagesExceptDrafts = messages.filter(message => message.is_draft !== true);

    return (
      <div>
        <PageTitle />
        <MessageListBase
          messages={messagesExceptDrafts}
          onMessageRead={this.handleSetMessageRead}
          onMessageUnread={this.handleSetMessageUnread}
          isFetching={isFetching}
          replyForm={(
            <ReplyForm
              discussionId={discussionId}
              internalId={internalId}
              onFocus={this.handleFocusDraft}
              draftFormRef={(node) => { this.replyFormRef = node; }}
            />
          )}
          replyExcerpt={(
            <ReplyExcerpt
              discussionId={discussionId}
              internalId={internalId}
              onFocus={this.handleFocusDraft}
              draftExcerptRef={(node) => { this.replyExcerptRef = node; }}
            />
           )}
          onForward={() => {}}
          onDelete={this.handleDelete}
          onMessageDelete={this.handleDeleteMessage}
          onMessageReply={this.makeHandleReplyToMessage(internalId)}
          loadMore={this.renderLoadMore()}
          onMessageCopyTo={copyMessageTo}
          updateTagCollection={updateTagCollection}
          isDraftFocus={this.state.isDraftFocus}
        />
      </div>
    );
  }
}

export default MessageList;
