import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReplyFormBase from '../../../../components/ReplyForm';
import NewDraftForm from '../../../../components/NewDraftForm';
import DraftMessageActionsContainer from '../../../../components/DraftMessageActionsContainer';
import ScrollToWhenHash from '../../../../components/ScrollToWhenHash';

class DraftForm extends Component {
  static propTypes = {
    discussionId: PropTypes.string.isRequired,
    allowEditRecipients: PropTypes.bool,
    message: PropTypes.shape({ }),
    parentMessage: PropTypes.shape({ }),
    draft: PropTypes.shape({ }),
    requestDraft: PropTypes.func.isRequired,
    editDraft: PropTypes.func.isRequired,
    saveDraft: PropTypes.func.isRequired,
    sendDraft: PropTypes.func.isRequired,
    onDeleteMessage: PropTypes.func.isRequired,
    user: PropTypes.shape({}),
  };

  static defaultProps = {
    allowEditRecipients: false,
    message: {},
    parentMessage: undefined,
    draft: undefined,
    user: undefined,
  };

  state = {
    isSending: false,
  };

  componentDidMount() {
    const { discussionId, draft } = this.props;
    if (!draft && discussionId) {
      this.props.requestDraft({ internalId: discussionId, discussionId });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.draft) {
      const { discussionId } = this.props;
      this.props.requestDraft({ internalId: discussionId, discussionId });
    }
  }

  makeHandle = action => ({ draft }) => {
    const { discussionId, message } = this.props;
    const params = { draft, message, internalId: discussionId };

    return action(params);
  };

  handleSend = () => {
    const { sendDraft, discussionId, message, draft } = this.props;
    const params = { draft, message, internalId: discussionId };

    this.setState({ isSending: true });

    return sendDraft(params).then(() => this.setState({ isSending: false }));
  }

  handleDelete = () => {
    const { message, discussionId, onDeleteMessage, allowEditRecipients } = this.props;

    onDeleteMessage({ message, internalId: discussionId, isNewDiscussion: allowEditRecipients });
  }

  renderDraftMessageActionsContainer = () => {
    const { message, discussionId } = this.props;

    return (<DraftMessageActionsContainer
      message={message}
      internalId={discussionId}
      onDelete={this.handleDelete}
    />);
  }

  render() {
    const {
       draft, discussionId, allowEditRecipients, user, editDraft, saveDraft,
       parentMessage,
    } = this.props;

    if (allowEditRecipients) {
      return (<NewDraftForm
        draft={draft}
        internalId={discussionId}
        onChange={this.makeHandle(editDraft)}
        onSave={this.makeHandle(saveDraft)}
        onSend={this.handleSend}
        renderDraftMessageActionsContainer={this.renderDraftMessageActionsContainer}
        user={user}
        isSending={this.state.isSending}
      />);
    }

    return (
      <ScrollToWhenHash id="reply">
        <ReplyFormBase
          parentMessage={parentMessage}
          draft={draft}
          onChange={this.makeHandle(editDraft)}
          onSave={this.makeHandle(saveDraft)}
          onSend={this.handleSend}
          isSending={this.state.isSending}
          renderDraftMessageActionsContainer={this.renderDraftMessageActionsContainer}
          user={user}
        />
      </ScrollToWhenHash>
    );
  }
}

export default DraftForm;
