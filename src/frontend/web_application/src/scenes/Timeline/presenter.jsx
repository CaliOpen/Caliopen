import React, { Component } from 'react';
import PropTypes from 'prop-types';
import throttle from 'lodash.throttle';
import { Trans } from 'lingui-react';
import { InfiniteScroll, BlockList, PageTitle, Button, MenuBar, Spinner, Modal } from '../../components/';
import MessageSelector from './components/MessageSelector';
import MessageItem from './components/MessageItem';
import { isMessageFromUser } from '../../services/message';
import { WithTags, TagsForm, getCleanedTagCollection, getTagNamesInCommon } from '../../modules/tags';
import { MessageNotifications } from '../../modules/notification';

import './style.scss';

const LOAD_MORE_THROTTLE = 1000;

class Timeline extends Component {
  static propTypes = {
    user: PropTypes.shape({}),
    requestMessages: PropTypes.func.isRequired,
    deleteMessage: PropTypes.func.isRequired,
    timelineFilter: PropTypes.string.isRequired,
    loadMore: PropTypes.func.isRequired,
    messages: PropTypes.arrayOf(PropTypes.shape({})),
    tags: PropTypes.arrayOf(PropTypes.shape({})),
    isFetching: PropTypes.bool,
    didInvalidate: PropTypes.bool,
    hasMore: PropTypes.bool,
    i18n: PropTypes.shape({}).isRequired,
    updateMessagesTags: PropTypes.func.isRequired,
  };

  static defaultProps = {
    messages: [],
    tags: [],
    user: undefined,
    isFetching: false,
    didInvalidate: false,
    hasMore: false,
  };

  state = {
    initialized: false,
    selectedMessages: [],
    isTagModalOpen: false,
    isDeleting: false,
  }

  componentDidMount() {
    const { loadMore } = this.props;

    this.loadMessages(this.props);

    this.throttledLoadMore = throttle(
      () => loadMore(this.props.timelineFilter),
      LOAD_MORE_THROTTLE,
      { trailing: false }
    );
  }

  componentWillReceiveProps(nextProps) {
    this.loadMessages(nextProps);
  }

  onSelectMessage = (type, messageId) => {
    if (type === 'add') {
      this.setState(prevState => ({
        ...prevState,
        selectedMessages: [...prevState.selectedMessages, messageId],
      }));
    }

    if (type === 'remove') {
      this.setState(prevState => ({
        ...prevState,
        selectedMessages: [...prevState.selectedMessages].filter(item => item !== messageId),
      }));
    }
  }

  onSelectAllMessages = (checked) => {
    const { messages } = this.props;
    const messagesIds = messages.map(message => message.message_id);

    this.setState(prevState => ({
      ...prevState,
      selectedMessages: checked ? messagesIds : [],
    }));
  }

  loadMessages = async (props) => {
    const {
      requestMessages, timelineFilter, didInvalidate, isFetching,
    } = props;
    if ((!this.state.initialized || didInvalidate) && !isFetching) {
      // "initialized" is not well named,
      // we consider it "initialized" as soon as we start fetching messages to prevent multiple
      // fetchs because setState would be applied at the very end after multiple
      // componentWillReceiveProps
      this.setState({ initialized: true });
      requestMessages(timelineFilter);
    }

    return Promise.resolve();
  }

  handleOpenTags = () => {
    this.setState(prevState => ({
      ...prevState,
      isTagModalOpen: true,
    }));
  }

  handleCloseTags = () => {
    this.setState(prevState => ({
      ...prevState,
      isTagModalOpen: false,
      selectedMessages: [],
    }));
  }

  handleDeleteMessages = () => {
    const { messages, deleteMessage } = this.props;
    const selectedMessageIds = new Set(this.state.selectedMessages);

    this.setState(prevState => ({
      ...prevState,
      isDeleting: true,
    }));

    return Promise.all(messages
      .filter(message => selectedMessageIds.has(message.message_id))
      .map(message => deleteMessage({ message })))
      .then(() => {
        this.setState(prevState => ({
          ...prevState,
          selectedMessages: [],
          isDeleting: false,
        }));
      });
  }

  loadMore = () => {
    if (this.props.hasMore) {
      this.throttledLoadMore();
    }
  }

  handleTagsChange = ({ tags }) => {
    const { updateMessagesTags, i18n } = this.props;

    return updateMessagesTags(i18n, this.state.selectedMessages, tags);
  }

  makeHandleClickClearNotifications = cb => () => {
    const { requestMessages, timelineFilter } = this.props;
    requestMessages(timelineFilter);
    cb();
  }

  renderNotifications = () => (
    <MessageNotifications
      key="1"
      render={({ notifications, clearNotifications }) => {
        if (!notifications.length) {
          return null;
        }

        return (
          <div className="s-timeline__new-msg">
            <Button display="inline" onClick={this.makeHandleClickClearNotifications(clearNotifications)}>
              <Trans id="timeline.new_messages">You have {notifications.length} new messages</Trans>
            </Button>
          </div>
        );
      }}
    />
  )

  renderList = ({ userTags }) => {
    const { user, messages } = this.props;

    return (
      <BlockList className="s-timeline__list">
        {[
          this.renderNotifications(),
          ...messages.map(message => (
            <MessageItem
              key={message.message_id}
              userTags={userTags}
              isMessageFromUser={(user && isMessageFromUser(message, user)) || false}
              message={message}
              isDeleting={this.state.isDeleting}
              onSelectMessage={this.onSelectMessage}
              isMessageSelected={[...this.state.selectedMessages].includes(message.message_id)}
            />
          )),
        ]}
      </BlockList>
    );
  }

  renderTagsModal = () => {
    const { messages, tags: userTags, i18n } = this.props;
    const selectedMessageIds = new Set(this.state.selectedMessages);
    const selectedMessages = messages
      .filter(message => selectedMessageIds.has(message.message_id));

    const tagNamesInCommon = getTagNamesInCommon(selectedMessages);
    const tagsInCommon = getCleanedTagCollection(userTags, tagNamesInCommon);

    const title = (
      <Trans
        id="tags.header.title"
        defaults={'Tags <0>(Total: {nb})</0>'}
        values={{ nb: tagsInCommon.length }}
        components={[
          (<span className="m-tags-form__count" />),
        ]}
      />
    );

    return (
      <Modal
        isOpen={this.state.isTagModalOpen}
        contentLabel={i18n._('tags.header.label', { defaults: 'Tags' })}
        title={title}
        onClose={this.handleCloseTags}
      >
        {selectedMessages.length > 1 && (
          <Trans id="tags.common_tags_applied">Common tags applied to the current selection:</Trans>
        )}
        <TagsForm
          userTags={userTags}
          tags={tagsInCommon}
          updateTags={this.handleTagsChange}
        />
      </Modal>
    );
  }

  render() {
    const {
      messages, isFetching, hasMore, i18n,
    } = this.props;

    return (
      <div className="s-timeline">
        <PageTitle title={i18n._('header.menu.discussions', { defaults: 'Messages' })} />
        <MenuBar className="s-timeline__menu-bar">
          <Spinner isLoading={isFetching} className="s-timeline__spinner" />
          <div className="s-timeline__col-selector">
            <MessageSelector
              indeterminate={
                this.state.selectedMessages.length > 0
                  && this.state.selectedMessages.length < messages.length
              }
              checked={
                this.state.selectedMessages.length === messages.length
                && this.state.selectedMessages.length > 0
              }
              count={this.state.selectedMessages.length}
              totalCount={messages.length}
              onSelectAllMessages={this.onSelectAllMessages}
              onEditTags={this.handleOpenTags}
              onDeleteMessages={this.handleDeleteMessages}
              isDeleting={this.state.isDeleting}
            />
          </div>
          {this.state.isTagModalOpen && this.renderTagsModal()}
        </MenuBar>
        <InfiniteScroll onReachBottom={this.loadMore}>
          <WithTags render={userTags => this.renderList({ userTags })} />
        </InfiniteScroll>
        {hasMore && (
          <div className="s-timeline__load-more">
            <Button shape="hollow" onClick={this.loadMore}><Trans id="general.action.load_more">Load more</Trans></Button>
          </div>
        )}
      </div>
    );
  }
}

export default Timeline;
