import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ActionBarWrapper, ActionBar } from '../../components';
import { ScrollDetector } from '../../modules/scroll';
import { deleteMessage } from '../../modules/message';
import { withTags } from '../../modules/tags';
import { withCurrentView } from './withCurrentView';
import MessageItem from './components/MessageItem';
import MessageSelector from './components/MessageSelector';
import './style.scss';

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      deleteMessage,
    },
    dispatch
  );
const connecting = connect(null, mapDispatchToProps);

@connecting
@withTags()
@withCurrentView()
class View extends Component {
  static propTypes = {
    className: PropTypes.string,
    deleteMessage: PropTypes.func.isRequired,
    messages: PropTypes.arrayOf(PropTypes.shape({})),
    tags: PropTypes.arrayOf(PropTypes.shape({})),
    isFetching: PropTypes.bool,
  };

  static defaultProps = {
    className: undefined,
    messages: undefined,
    tags: undefined,
    isFetching: false,
  };

  state = {
    selectedMessages: [],
    isDeleting: false,
  };

  handleToggleSelectMessage = ({ message }) => {
    this.setState((prevState) => {
      if (prevState.selectedMessages.includes(message)) {
        return {
          selectedMessages: prevState.selectedMessages.filter(
            (msg) => msg !== message
          ),
        };
      }

      return {
        selectedMessages: [...prevState.selectedMessages, message],
      };
    });
  };

  handleToggleSelectAllMessages = () => {
    const { messages } = this.props;

    this.setState((prevState) => ({
      selectedMessages: prevState.selectedMessages.length > 0 ? [] : messages,
    }));
  };

  handleDeleteMessages = async () => {
    this.setState({ isDeleting: true });
    try {
      await Promise.all(
        this.state.selectedMessages.map((message) =>
          this.props.deleteMessage({ message })
        )
      );
    } finally {
      this.setState({ isDeleting: false, selectedMessages: [] });
    }
  };

  renderActionBar() {
    const { isFetching, messages } = this.props;
    const nbSelectedMessages = this.state.selectedMessages.length;

    return (
      <ScrollDetector
        offset={136}
        render={(isSticky) => (
          <ActionBarWrapper isSticky={isSticky}>
            <ActionBar
              hr={false}
              isLoading={isFetching}
              actionsNode={
                <div className="s-view-action-bar">
                  <MessageSelector
                    count={nbSelectedMessages}
                    checked={
                      nbSelectedMessages > 0 &&
                      nbSelectedMessages === messages.length
                    }
                    totalCount={messages.length}
                    onToggleSelectAllMessages={
                      this.handleToggleSelectAllMessages
                    }
                    onDeleteMessages={this.handleDeleteMessages}
                    isDeleting={this.state.isDeleting}
                    indeterminate={
                      nbSelectedMessages > 0 &&
                      nbSelectedMessages < messages.length
                    }
                  />
                </div>
              }
            />
          </ActionBarWrapper>
        )}
      />
    );
  }

  render() {
    const { className, messages, tags } = this.props;

    return (
      <div className={classnames(className)}>
        {this.renderActionBar()}
        <div>
          {messages.map((message) => (
            <MessageItem
              key={message.message_id}
              message={message}
              className="s-view__message"
              userTags={tags}
              isMessageSelected={this.state.selectedMessages.includes(message)}
              onToggleSelectMessage={this.handleToggleSelectMessage}
              isDeleting={this.state.isDeleting}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default View;
