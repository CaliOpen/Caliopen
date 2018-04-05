import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ReplyForm as ReplyFormBase, NewDraftForm, DraftMessageActionsContainer, AttachmentManager } from '../../../../modules/draftMessage';

class ReplyForm extends Component {
  static propTypes = {
    i18n: PropTypes.shape({}).isRequired,
    discussionId: PropTypes.string.isRequired,
    allowEditRecipients: PropTypes.bool,
    message: PropTypes.shape({ }),
    parentMessage: PropTypes.shape({ }),
    draft: PropTypes.shape({ }),
    isFetching: PropTypes.bool,
    requestDraft: PropTypes.func.isRequired,
    onEditDraft: PropTypes.func.isRequired,
    onSaveDraft: PropTypes.func.isRequired,
    onSendDraft: PropTypes.func.isRequired,
    onDeleteMessage: PropTypes.func.isRequired,
    user: PropTypes.shape({}),
    onUpdateEntityTags: PropTypes.func.isRequired,
    onUploadAttachments: PropTypes.func.isRequired,
    onDeleteAttachement: PropTypes.func.isRequired,
    draftFormRef: PropTypes.func,
  };

  static defaultProps = {
    allowEditRecipients: false,
    message: undefined,
    parentMessage: undefined,
    draft: undefined,
    isFetching: false,
    user: undefined,
    draftFormRef: () => {},
  };

  state = {
    isSending: false,
  };

  componentDidMount() {
    const { discussionId, draft, isFetching } = this.props;
    if (!draft && !isFetching) {
      this.props.requestDraft({ internalId: discussionId, discussionId });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.draft && !nextProps.isFetching) {
      this.props.requestDraft({
        internalId: nextProps.discussionId, discussionId: nextProps.discussionId,
      });
    }
  }

  handleSave = async ({ draft }) => {
    const {
      discussionId, message, notifySuccess, notifyError, i18n, onSaveDraft,
    } = this.props;

    try {
      await onSaveDraft({ draft, message, internalId: discussionId });

      return notifySuccess({ message: i18n._('draft.feedback.saved', { defaults: 'Draft saved' }) });
    } catch (err) {
      return notifyError({
        message: i18n._('draft.feedback.save-error', { defaults: 'Unable to save the draft' }),
      });
    }
  }

  handleEdit = ({ draft }) => {
    const { discussionId, message, onEditDraft } = this.props;

    return onEditDraft({ internalId: discussionId, draft, message });
  };

  handleSend = async () => {
    const {
      onSendDraft, discussionId, message, draft, notifyError, i18n,
    } = this.props;

    this.setState({ isSending: true });

    try {
      await onSendDraft({ draft, message, internalId: discussionId });
    } catch (err) {
      notifyError({
        message: i18n._('draft.feedback.send-error', { defaults: 'Unable to send the message' }),
      });
    }
    this.setState({ isSending: false });
  }

  handleDelete = () => {
    const {
      message, discussionId, onDeleteMessage, allowEditRecipients,
    } = this.props;

    onDeleteMessage({ message, internalId: discussionId, isNewDiscussion: allowEditRecipients });
  }

  handleTagsChange = async ({ tags }) => {
    const {
      onUpdateEntityTags, i18n, message, draft, discussionId,
    } = this.props;

    return onUpdateEntityTags(discussionId, i18n, message, { type: 'message', entity: draft, tags });
  }

  handleFilesChange = async ({ attachments }) => {
    const {
      onUploadAttachments, i18n, message, draft, discussionId,
    } = this.props;

    return onUploadAttachments(discussionId, i18n, message, { draft, attachments });
  }

  handleDeleteAttachement = (attachment) => {
    const {
      onDeleteAttachement, i18n, message, draft, discussionId,
    } = this.props;

    return onDeleteAttachement(discussionId, i18n, message, { draft, attachment });
  }

  renderDraftMessageActionsContainer = () => {
    const { message, discussionId } = this.props;

    return (<DraftMessageActionsContainer
      message={message}
      internalId={discussionId}
      onDelete={this.handleDelete}
      onTagsChange={this.handleTagsChange}
    />);
  }

  renderAttachments = () => {
    const { draft } = this.props;

    if (!draft) {
      return null;
    }

    const props = {
      message: draft,
      onUploadAttachments: this.handleFilesChange,
      onDeleteAttachement: this.handleDeleteAttachement,
    };

    return (
      <AttachmentManager {...props} />
    );
  }

  render() {
    const {
      draft, discussionId, allowEditRecipients, user, parentMessage, draftFormRef,
    } = this.props;

    if (allowEditRecipients) {
      return (<NewDraftForm
        draft={draft}
        internalId={discussionId}
        onChange={this.handleEdit}
        onSave={this.handleSave}
        onSend={this.handleSend}
        renderDraftMessageActionsContainer={this.renderDraftMessageActionsContainer}
        renderAttachments={this.renderAttachments}
        user={user}
        isSending={this.state.isSending}
        draftFormRef={draftFormRef}
      />);
    }

    return (
      <div id="reply">
        <ReplyFormBase
          parentMessage={parentMessage}
          draft={draft}
          onChange={this.handleEdit}
          onSave={this.handleSave}
          onSend={this.handleSend}
          isSending={this.state.isSending}
          renderDraftMessageActionsContainer={this.renderDraftMessageActionsContainer}
          renderAttachments={this.renderAttachments}
          user={user}
          draftFormRef={draftFormRef}
        />
      </div>
    );
  }
}

export default ReplyForm;
