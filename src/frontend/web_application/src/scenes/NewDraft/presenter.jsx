import React, { Component } from 'react';
import PropTypes from 'prop-types';
import NewDraftForm from '../../components/NewDraftForm';

class NewDraft extends Component {
  static propTypes = {
    draft: PropTypes.shape({}),
    message: PropTypes.shape({}),
    internalId: PropTypes.string,
    requestNewDraft: PropTypes.func.isRequired,
    editDraft: PropTypes.func.isRequired,
    saveDraft: PropTypes.func.isRequired,
    sendDraft: PropTypes.func.isRequired,
  };

  static defaultProps = {
    draft: undefined,
    message: undefined,
    internalId: undefined,
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

  render() {
    const { draft, internalId, editDraft, saveDraft, sendDraft } = this.props;

    return (
      <NewDraftForm
        internalId={internalId}
        draft={draft}
        onChange={this.makeHandle(editDraft)}
        onSave={this.makeHandle(saveDraft)}
        onSend={this.makeHandle(sendDraft)}
      />
    );
  }
}

export default NewDraft;
