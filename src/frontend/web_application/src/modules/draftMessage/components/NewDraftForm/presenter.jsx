import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { v1 as uuidV1 } from 'uuid';
import { Trans } from 'lingui-react';
import { Button, Icon, Spinner, Dropdown, withDropdownControl, TextFieldGroup } from '../../../../components/';
import { ContactAvatarLetter } from '../../../../modules/avatar';
import DiscussionDraft, { TopRow, BodyRow, BottomRow } from '../DiscussionDraft';
import DiscussionTextarea from '../DiscussionTextarea';
import RecipientList from '../RecipientList';
import './style.scss';

const DropdownControl = withDropdownControl(Button);

function generateStateFromProps(props) {
  const { draft } = props;

  return { draft };
}

const hasMailSupport = recipients =>
  recipients && recipients.find(recipient => recipient.protocol === 'email') && true;

class NewDraftForm extends Component {
  static propTypes = {
    draft: PropTypes.shape({}),
    internalId: PropTypes.string,
    onSave: PropTypes.func.isRequired,
    onSend: PropTypes.func.isRequired,
    onChange: PropTypes.func,
    user: PropTypes.shape({}),
    renderDraftMessageActionsContainer: PropTypes.func.isRequired,
    renderAttachments: PropTypes.func.isRequired,
    i18n: PropTypes.shape({}).isRequired,
    isSending: PropTypes.bool.isRequired,
    draftFormRef: PropTypes.func,
  };
  static defaultProps = {
    draft: {},
    internalId: undefined,
    onChange: () => {},
    user: { contact: {} },
    draftFormRef: () => {},
  };

  state = {
    draft: { participants: [], subject: '', body: '' },
    hasChanged: false,
  };

  componentWillMount() {
    this.setState(prevState => generateStateFromProps(this.props, prevState));
  }

  componentWillReceiveProps(newProps) {
    this.setState(prevState => generateStateFromProps(newProps, prevState));
  }

  handleSave = () => {
    const { draft } = this.state;
    this.props.onSave({ draft });
  }

  handleSend = () => {
    const { draft } = this.state;
    this.props.onSend({ draft });
  }

  handleChange = (ev) => {
    const { name, value } = ev.target;

    this.setState((prevState) => {
      const draft = {
        ...prevState.draft,
        [name]: value,
      };

      return {
        draft,
        hasChanged: true,
      };
    }, () => {
      this.props.onChange({ draft: this.state.draft });
    });
  }

  handleRecipientsChange = (recipients) => {
    this.setState(prevState => ({
      draft: {
        ...prevState.draft,
        // no need to merge author, backend does it
        participants: recipients,
      },
      hasChanged: true,
    }), () => {
      this.props.onChange({ draft: this.state.draft });
    });
  }

  renderDraftType() {
    const { i18n } = this.props;
    const typeTranslations = {
      email: i18n._('reply-form.protocol.email', { defaults: 'email' }),
    };
    const draftType = typeTranslations[this.state.draft.type];

    return (
      <div className="m-new-draft__type">
        <span className="m-new-draft__type-label">
          <Trans id="reply-form.by">by {draftType}</Trans>
        </span>
        {' '}
        <Icon className="m-new-draft__type-icon" type={this.state.draft.type} spaced />
        {' '}
        <Icon type="angle-down" spaced />
      </div>
    );
  }

  render() {
    const {
      user, internalId, renderDraftMessageActionsContainer, i18n, isSending, renderAttachments,
      draftFormRef,
    } = this.props;
    const dropdownId = uuidV1();
    const recipients = this.state.draft.participants && this.state.draft.participants
      .filter(participant => participant.type.toLowerCase() !== 'from');
    const isMessageValid = (recipients && recipients.length !== 0);

    return (
      <DiscussionDraft className="m-new-draft" draftFormRef={draftFormRef}>
        <div className="m-new-draft__avatar-col">
          <ContactAvatarLetter
            contact={user.contact}
            className="m-new-draft__avatar"
          />
        </div>
        <form method="POST" className="m-new-draft__form-col">
          <TopRow className="m-new-draft__top-bar">
            <div className="m-new-draft__top-bar-info">
              <div className="m-new-draft__author"><Trans id="reply-form.you">You</Trans></div>
              {this.state.draft.type && this.renderDraftType()}
              <div className="m-new-draft__date"><Trans id="reply-form.now">Now</Trans></div>
            </div>

            <DropdownControl toggleId={dropdownId} className="m-new-draft__top-actions-switcher" icon="ellipsis-v" />

            <Dropdown
              id={dropdownId}
              className="m-new-draft__top-actions-menu"
              alignRight
              isMenu
              closeOnClick="all"
            >{renderDraftMessageActionsContainer()}</Dropdown>
          </TopRow>
          <BodyRow className="m-new-draft__body">
            <RecipientList
              internalId={internalId}
              recipients={recipients}
              onRecipientsChange={this.handleRecipientsChange}
            />
            {hasMailSupport(recipients) && (
              <TextFieldGroup
                className="m-new-draft__subject"
                display="inline"
                label={i18n._('messages.compose.form.subject.label', { defaults: 'Subject' })}
                name="subject"
                value={this.state.draft.subject}
                onChange={this.handleChange}
              />
            )}
            <DiscussionTextarea
              body={this.state.draft.body}
              onChange={this.handleChange}
            />
          </BodyRow>
          <BottomRow className="m-new-draft__attachements">
            {renderAttachments()}
          </BottomRow>
          <BottomRow className="m-new-draft__bottom-bar">
            <Button
              className="m-new-draft__bottom-action"
              shape="plain"
              onClick={this.handleSend}
              icon={isSending ? (<Spinner isLoading display="inline" />) : 'send'}
              responsive="icon-only"
              disabled={!isMessageValid || isSending}
            >
              <Trans id="messages.compose.action.send">Send</Trans>
            </Button>
            <Button
              className="m-new-draft__bottom-action"
              onClick={this.handleSave}
              icon="save"
              responsive="icon-only"
              disabled={!this.state.hasChanged}
            >
              <Trans id="messages.compose.action.save">Save</Trans>
            </Button>
            <Button className="m-new-draft__bottom-action m-new-draft__bottom-action--editor" icon="editor" responsive="icon-only" />
          </BottomRow>
        </form>
      </DiscussionDraft>
    );
  }
}

export default NewDraftForm;
