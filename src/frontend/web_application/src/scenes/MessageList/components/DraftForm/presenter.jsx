import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReplyFormBase from '../../../../components/ReplyForm';
import NewDraftForm from '../../../../components/NewDraftForm';

class DraftForm extends Component {
  static propTypes = {
    discussionId: PropTypes.string.isRequired,
    allowEditRecipients: PropTypes.bool,
    message: PropTypes.shape({ }),
    draft: PropTypes.shape({ }),
    requestDraft: PropTypes.func.isRequired,
    editDraft: PropTypes.func.isRequired,
    saveDraft: PropTypes.func.isRequired,
    sendDraft: PropTypes.func.isRequired,
    user: PropTypes.shape({}),
  };

  static defaultProps = {
    allowEditRecipients: false,
    message: {},
    draft: null,
    user: undefined,
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

  render() {
    const {
       draft, discussionId, allowEditRecipients, user, editDraft, saveDraft, sendDraft,
    } = this.props;

    if (!draft) {
      return (<div />);
    }

    if (allowEditRecipients) {
      return (<NewDraftForm
        draft={draft}
        internalId={discussionId}
        onChange={this.makeHandle(editDraft)}
        onSave={this.makeHandle(saveDraft)}
        onSend={this.makeHandle(sendDraft)}
        user={user}
      />);
    }

    return (
      <ReplyFormBase
        draft={draft}
        onChange={this.makeHandle(editDraft)}
        onSave={this.makeHandle(saveDraft)}
        onSend={this.makeHandle(sendDraft)}
        user={user}
      />
    );
  }
}

export default DraftForm;
