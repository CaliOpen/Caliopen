import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ScrollToWhenHash from '../../components/ScrollToWhenHash';
import NewDraftForm from '../../components/NewDraftForm';
import DraftMessageActionsContainer from '../../components/DraftMessageActionsContainer';

class NewDraft extends Component {
  static propTypes = {
    draft: PropTypes.shape({}),
    message: PropTypes.shape({}),
    internalId: PropTypes.string,
    requestNewDraft: PropTypes.func.isRequired,
    editDraft: PropTypes.func.isRequired,
    sendDraft: PropTypes.func.isRequired,
    onSaveDraft: PropTypes.func.isRequired,
    onDeleteMessage: PropTypes.func.isRequired,
  };

  static defaultProps = {
    draft: undefined,
    message: undefined,
    internalId: undefined,
  };

  state = {
    isSending: false,
  };

  componentDidMount() {
    const { internalId, draft, requestNewDraft } = this.props;
    if (!internalId || !draft) {
      requestNewDraft({ internalId });
    }
  }

  makeHandle = action => ({ draft }) => {
    const { internalId, message } = this.props;

    return action({ internalId, draft, message });
  };

  handleSend = ({ draft }) => {
    const { sendDraft, internalId, message } = this.props;
    const params = { draft, message, internalId };

    this.setState({ isSending: true });

    return sendDraft(params).then(() => this.setState({ isSending: false }));
  }

  handleDelete = () => {
    const { message, onDeleteMessage } = this.props;
    onDeleteMessage({ message });
  };

  renderDraftMessageActionsContainer = () => {
    const { message, internalId } = this.props;

    return (
      <DraftMessageActionsContainer
        message={message}
        internalId={internalId}
        onDelete={this.handleDelete}
      />
    );
  }

  render() {
    const { draft, internalId, editDraft, onSaveDraft } = this.props;

    return (
      <ScrollToWhenHash forceTop>
        <NewDraftForm
          internalId={internalId}
          draft={draft}
          onChange={this.makeHandle(editDraft)}
          onSave={this.makeHandle(onSaveDraft)}
          onSend={this.handleSend}
          isSending={this.state.isSending}
          renderDraftMessageActionsContainer={this.renderDraftMessageActionsContainer}
        />
      </ScrollToWhenHash>
    );
  }
}

export default NewDraft;
