import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import { Button, PlaceholderBlock } from '../../../../components';
import Message from '../Message';
import ProtocolSwitch from '../ProtocolSwitch';
import { getAveragePIMessage } from '../../../../modules/pi';
import { withSettings } from '../../../../modules/settings';
import { CheckDecryption } from '../../../../modules/encryption';

import './style.scss';

@withSettings()
class MessageList extends Component {
  static propTypes = {
    messages: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    loadMore: PropTypes.func,
    hasMore: PropTypes.bool,
    scrollToTarget: PropTypes.func,
    isFetching: PropTypes.bool.isRequired,
    onMessageRead: PropTypes.func.isRequired,
    onMessageUnread: PropTypes.func.isRequired,
    onDeleteMessageSuccess: PropTypes.func.isRequired,
    user: PropTypes.shape({}),
    hash: PropTypes.string,
    settings: PropTypes.shape({}).isRequired,
  };

  static defaultProps = {
    scrollToTarget: undefined,
    hash: undefined,
    loadMore: undefined,
    hasMore: false,
    user: undefined,
  };

  findMessageBefore(message) {
    const { messages } = this.props;
    const index = messages.indexOf(message) - 1;

    return messages[index];
  }

  renderPlaceholder = () => (
    <div className="m-message-list">
      {[1, 2, 3].map((n) => (
        <PlaceholderBlock key={n} className="m-message-list__placeholder" />
      ))}
    </div>
  );

  renderLoadMore() {
    const { hasMore, loadMore, isFetching } = this.props;

    return (
      loadMore &&
      !isFetching &&
      hasMore && (
        <Button
          shape="hollow"
          onClick={loadMore}
          className="m-message-list__load-more"
        >
          <Trans id="general.action.load_more" message="Load more" />
        </Button>
      )
    );
  }

  renderList() {
    const {
      messages,
      onMessageRead,
      onMessageUnread,
      onMessageDelete,
      hash,
      scrollToTarget,
      user,
      settings,
      onDeleteMessageSuccess,
    } = this.props;

    return messages.reduce((acc, message) => {
      const result = [...acc];
      if (
        message.pi_message &&
        message.protocol !== 'email' &&
        acc.length > 0 &&
        this.findMessageBefore(message).protocol !== message.protocol
      ) {
        result.push(
          <ProtocolSwitch
            newProtocol={message.protocol}
            pi={getAveragePIMessage({ message })}
            date={message.date}
            key={`switch-${message.message_id}`}
            settings={settings}
          />
        );
      }

      result.push(
        <Message
          onMessageRead={onMessageRead}
          onMessageUnread={onMessageUnread}
          onDeleteMessageSuccess={onDeleteMessageSuccess}
          message={message}
          key={message.message_id}
          scrollToMe={message.message_id === hash ? scrollToTarget : undefined}
          user={user}
          settings={settings}
        />
      );

      return result;
    }, []);
  }

  render() {
    const { isFetching, messages } = this.props;

    if (isFetching && messages.length === 0) {
      return this.renderPlaceholder();
    }

    return (
      <div className="m-message-list">
        <div className="m-message-list__load-more">{this.renderLoadMore()}</div>
        {this.renderList()}
        <CheckDecryption messages={messages} />
      </div>
    );
  }
}

export default MessageList;
