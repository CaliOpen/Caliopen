import React, { Component } from 'react';
import PropTypes from 'prop-types';
import throttle from 'lodash/throttle';
import classnames from 'classnames';
import { withRouter } from 'react-router-dom';
import { Trans, withI18n } from '@lingui/react';
import {
  ActionBarWrapper,
  ActionBar,
  ActionBarButton,
  Badge,
  Modal,
  Link,
} from '../../components';
import MessageList from './components/MessageList';
import ReplyExcerpt from './components/ReplyExcerpt';
import AddParticipantsToContactBook from './components/AddParticipantsToContactBook';
import QuickDraftForm from './components/QuickDraftForm';
import { withCloseTab } from '../../modules/tab';
import { ManageEntityTags, getTagLabel } from '../../modules/tags';
import { ScrollDetector, withScrollManager } from '../../modules/scroll';
import { addEventListener } from '../../services/event-manager';

import './style.scss';
import './discussion-action-bar.scss';

const LOAD_MORE_THROTTLE = 1000;

@withScrollManager()
@withCloseTab()
@withI18n()
@withRouter
class Discussion extends Component {
  static propTypes = {
    loadMore: PropTypes.func.isRequired,
    discussionId: PropTypes.string.isRequired,
    draftMessageId: PropTypes.string,
    draftMessage: PropTypes.shape({}),
    discussion: PropTypes.shape({}),
    requestDiscussion: PropTypes.func.isRequired,
    user: PropTypes.shape({}),
    isUserFetching: PropTypes.bool.isRequired,
    scrollManager: PropTypes.shape({
      scrollToTarget: PropTypes.func.isRequired,
    }).isRequired,
    isFetching: PropTypes.bool.isRequired,
    didInvalidate: PropTypes.bool.isRequired,
    hasMore: PropTypes.bool.isRequired,
    location: PropTypes.shape({}).isRequired,
    lastMessage: PropTypes.shape({}),
    messages: PropTypes.arrayOf(PropTypes.shape({})),
    canBeClosed: PropTypes.bool.isRequired,
    onMessageReply: PropTypes.func.isRequired,
    setMessageRead: PropTypes.func.isRequired,
    deleteMessage: PropTypes.func.isRequired,
    // XXX: waiting for API
    // deleteDiscussion: PropTypes.func.isRequired,
    updateDiscussionTags: PropTypes.func.isRequired,
    closeTab: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
    getUser: PropTypes.func.isRequired,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    tags: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    firstUnreadMessage: PropTypes.shape({}),
  };

  static defaultProps = {
    draftMessageId: undefined,
    draftMessage: undefined,
    discussion: undefined,
    lastMessage: undefined,
    messages: [],
    user: undefined,
    firstUnreadMessage: undefined,
  };

  state = {
    isDraftFocus: false,
    isTagModalOpen: false,
    initialized: false,
  };

  componentDidMount() {
    const { getUser, user, isUserFetching, requestDiscussion, isFetching } =
      this.props;

    if (!user && !isUserFetching) {
      getUser();
    }

    if (!this.state.initialized && !isFetching) {
      requestDiscussion().then(() => {
        this.setState(
          {
            initialized: true,
          },
          () => {
            this.eventuallyCloseTab();
          }
        );
      });
    }

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

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { didInvalidate, isFetching } = nextProps;

    if (didInvalidate && !isFetching) {
      this.props.requestDiscussion().then(() => this.eventuallyCloseTab());
    }
  }

  componentWillUnmount() {
    this.unsubscribeClickEvent();
  }

  eventuallyCloseTab = () => {
    const { isFetching, canBeClosed, closeTab } = this.props;

    if (this.state.initialized && !isFetching && canBeClosed) {
      closeTab();
    }
  };

  handleOpenTags = () => {
    this.setState((prevState) => ({
      ...prevState,
      isTagModalOpen: true,
    }));
  };

  handleCloseTags = () => {
    this.setState((prevState) => ({
      ...prevState,
      isTagModalOpen: false,
    }));
  };

  handleFocusDraft = () => {
    this.setState({
      isDraftFocus: true,
    });
  };

  handleDeleteMessage = async ({ message }) => {
    const { deleteMessage } = this.props;

    await deleteMessage({ message });
    this.eventuallyCloseTab();
  };

  handleSetMessageRead = ({ message }) => {
    this.props.setMessageRead({ message, isRead: true });
  };

  handleSetMessageUnread = ({ message }) => {
    this.props.setMessageRead({ message, isRead: false });
  };

  handleMessageReply = () => {
    const { messages, onMessageReply, push } = this.props;
    const message = messages[messages.length - 1];

    onMessageReply(message);
    push({ hash: 'reply' });
  };

  handleTagsChange = async ({ tags }) => {
    const { i18n, messages, updateDiscussionTags } = this.props;

    return updateDiscussionTags({ i18n, messages, tags });
  };

  loadMore = () => {
    const { hasMore, isFetching } = this.props;

    if (!isFetching && hasMore) {
      this.throttledLoadMore();
    }
  };

  // handleDeleteAll = async () => {
  //   const {
  //     messages, deleteDiscussion, discussionId, closeTab,
  //   } = this.props;
  //
  //   // FIXME : only deletes fetched messages.
  //   deleteDiscussion({ discussionId, messages });
  //   closeTab();
  // };

  getHash = () => {
    const { location } = this.props;

    return location.hash ? location.hash.slice(1) : null;
  };

  renderTags = ({ tags }) => {
    const { i18n } = this.props;

    return (
      tags && (
        <ul className="s-discussion-action-bar__tags s-discussion-action-bar__action s-discussion__tags">
          {tags.map((tag) => (
            <li key={tag.name} className="s-discussion__tag">
              <Badge
                to={`/search-results?term=${getTagLabel(
                  i18n,
                  tag
                )}&doctype=message`}
              >
                {tag.name}
              </Badge>
            </li>
          ))}
        </ul>
      )
    );
  };

  renderTagModal = () => {
    const { discussion, i18n } = this.props;
    const nb = discussion && discussion.tags ? discussion.tags.length : 0;
    const title = (
      <Trans
        id="tags.header.title"
        message="Tags <0>(Total: {nb})</0>"
        values={{ nb }}
        components={[<span className="m-tags-form__count" />]}
      />
    );

    return (
      <Modal
        isOpen={this.state.isTagModalOpen}
        contentLabel={i18n._(/* i18n */ 'tags.header.label', null, {
          message: 'Tags',
        })}
        title={title}
        onClose={this.handleCloseTags}
      >
        <ManageEntityTags
          type="discussion"
          entity={discussion}
          onChange={this.handleTagsChange}
        />
      </Modal>
    );
  };

  renderActionBar() {
    const { lastMessage, isFetching, discussion } = this.props;

    return (
      <ScrollDetector
        offset={136}
        render={(isSticky) => (
          <ActionBarWrapper isSticky={isSticky}>
            <ActionBar
              hr={false}
              isLoading={isFetching}
              actionsNode={
                <div className="s-discussion-action-bar">
                  {discussion ? this.renderTags(discussion) : null}
                  <div className="s-discussion-action-bar__actions">
                    {lastMessage && (
                      <AddParticipantsToContactBook
                        className="s-discussion-action-bar__action"
                        message={lastMessage}
                      />
                    )}
                    <strong className="s-discussion-action-bar__action-label">
                      <Trans
                        id="discussion.action.label"
                        message="Whole discussion"
                      />
                      :
                    </strong>
                    <ActionBarButton
                      className="s-discussion-action-bar__action"
                      display="inline"
                      noDecoration
                      icon="reply"
                      onClick={this.handleMessageReply}
                      responsive="icon-only"
                    >
                      <Trans id="discussion.action.reply" message="Reply" />
                    </ActionBarButton>
                    {/*
                      <ActionBarButton
                        className="m-message-list__action"
                        display="inline"
                        noDecoration
                        icon="tags"
                        onClick={this.handleOpenTags}
                        responsive="icon-only"
                      >
                        Tag
                      </ActionBarButton>
                      <ActionBarButton
                        className="m-message-list__action"
                        display="inline"
                        noDecoration
                        icon="trash"
                        onClick={this.handleDeleteAll}
                        responsive="icon-only"
                      >
                        Delete
                      </ActionBarButton>
                    */}
                  </div>
                </div>
              }
            />
          </ActionBarWrapper>
        )}
      />
    );
  }

  render() {
    const {
      discussionId,
      messages,
      scrollManager: { scrollToTarget },
      isFetching,
      hasMore,
      user,
      isUserFetching,
      firstUnreadMessage,
      draftMessage,
      draftMessageId,
    } = this.props;
    const hash = this.getHash();

    return (
      <section id={`discussion-${discussionId}`} className="s-discussion">
        {this.renderActionBar()}
        {this.renderTagModal()}
        <MessageList
          className="m-message-list"
          messages={messages}
          loadMore={this.loadMore}
          hasMore={hasMore}
          isFetching={isFetching}
          hash={hash}
          onMessageRead={this.handleSetMessageRead}
          onMessageUnread={this.handleSetMessageUnread}
          onDeleteMessageSuccess={this.eventuallyCloseTab}
          scrollToTarget={scrollToTarget}
          user={user}
          isUserFetching={isUserFetching}
        />
        {!!firstUnreadMessage && (
          <Link
            className="s-discussion__goto-unread-button"
            to={{
              hash: firstUnreadMessage.message_id,
              state: { key: Math.random() },
            }}
            badge
          >
            <Trans
              id="discussion.action.goto_unread_message"
              message="You have unread messages ↑"
            />
          </Link>
        )}
        <div
          className={classnames('s-discussion__reply', {
            's-discussion__reply--open': this.state.isDraftFocus,
          })}
        >
          <QuickDraftForm
            discussionId={discussionId}
            onFocus={this.handleFocusDraft}
            innerRef={(node) => {
              this.replyFormRef = node;
            }}
          />
        </div>
        <div
          className={classnames('s-discussion__reply-excerpt', {
            's-discussion__reply-excerpt--close': this.state.isDraftFocus,
          })}
        >
          <ReplyExcerpt
            discussionId={discussionId}
            onFocus={this.handleFocusDraft}
            draftExcerptRef={(node) => {
              this.replyExcerptRef = node;
            }}
          />
        </div>
      </section>
    );
  }
}

export default Discussion;
