import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { v1 as uuidV1 } from 'uuid';
import { Trans } from 'lingui-react';
import { Link, Button, Spinner, Icon, Dropdown, withDropdownControl } from '../../../../components';
import { ContactAvatarLetter } from '../../../../modules/avatar';
import DiscussionDraft, { TopRow, BodyRow, BottomRow } from '../DiscussionDraft';
import DiscussionTextarea from '../DiscussionTextarea';
import './style.scss';

const DropdownControl = withDropdownControl(Button);

function generateStateFromProps(props) {
  const { draft } = props;

  return { draft };
}

class ReplyForm extends Component {
  static propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    draft: PropTypes.shape({}),
    parentMessage: PropTypes.shape({}),
    onSave: PropTypes.func.isRequired,
    onSend: PropTypes.func.isRequired,
    onChange: PropTypes.func,
    user: PropTypes.shape({}),
    renderDraftMessageActionsContainer: PropTypes.func.isRequired,
    renderAttachments: PropTypes.func.isRequired,
    i18n: PropTypes.shape({}).isRequired,
    isSending: PropTypes.bool,
    draftFormRef: PropTypes.func,
  };
  static defaultProps = {
    draft: {
      body: '',
    },
    parentMessage: undefined,
    onChange: () => {},
    user: { contact: {} },
    isSending: false,
    draftFormRef: () => {},
  };

  state = {
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
  };

  handleSend = () => {
    const { draft } = this.state;
    this.props.onSend({ draft });
  };

  handleChange = (ev) => {
    const { name, value } = ev.target;

    this.setState((prevState) => {
      const draft = { ...prevState.draft, [name]: value };

      return { draft, hasChanged: true };
    }, () => {
      this.props.onChange({ draft: this.state.draft });
    });
  };

  renderDraftType() {
    const { i18n } = this.props;
    const typeTranslations = {
      email: i18n._('reply-form.protocol.email', { defaults: 'email' }),
    };
    const draftType = typeTranslations[this.state.draft.type];

    return (
      <div className="m-reply__type">
        <span className="m-reply__type-label">
          <Trans id="reply-form.by">by {draftType}</Trans>
        </span>
        {' '}
        <Icon className="m-reply__type-icon" type={this.state.draft.type} spaced />
        {' '}
        <Icon type="angle-down" spaced />
      </div>
    );
  }

  render() {
    const {
      user, parentMessage, renderDraftMessageActionsContainer, isSending, renderAttachments,
      draftFormRef,
    } = this.props;
    const dropdownId = uuidV1();
    const excerpt = parentMessage && parentMessage.excerpt;

    return (
      <DiscussionDraft className="m-reply" draftFormRef={draftFormRef}>
        <div className="m-reply__avatar-col">
          <ContactAvatarLetter
            contact={user.contact}
            className="m-reply__avatar"
          />
        </div>
        <form method="POST" className="m-reply__form-col">
          <TopRow className="m-reply__top-bar">
            <div className="m-reply__top-bar-info">
              <div className="m-reply__author"><Trans id="reply-form.you">You</Trans></div>
              {this.state.draft.type && this.renderDraftType()}
              <div className="m-reply__date"><Trans id="reply-form.now">Now</Trans></div>
            </div>

            <DropdownControl toggleId={dropdownId} className="m-reply__top-actions-switcher" icon="ellipsis-v" />

            <Dropdown
              id={dropdownId}
              className="m-reply__top-actions-menu"
              alignRight
              isMenu
              closeOnClick="all"
            >
              {renderDraftMessageActionsContainer()}
            </Dropdown>
          </TopRow>
          {parentMessage && (
            <div className="m-reply__parent">
              <Link to={`#${parentMessage.message_id}`} className="m-reply__parent-link">
                <Trans id="reply-form.in-reply-to">In reply to: {excerpt}</Trans>
              </Link>
            </div>
          )}
          <BodyRow className="m-reply__body">
            <DiscussionTextarea
              body={this.state.draft.body}
              onChange={this.handleChange}
            />
          </BodyRow>
          <BottomRow className="m-new-draft__attachements">
            {renderAttachments()}
          </BottomRow>
          <BottomRow className="m-reply__bottom-bar">
            <Button
              className="m-reply__bottom-action"
              onClick={this.handleSend}
              icon={isSending ? (<Spinner isLoading display="inline" />) : 'send'}
              responsive="icon-only"
              disabled={isSending || !this.state.draft.body.length}
            >
              <Trans id="messages.compose.action.send">Send</Trans>
            </Button>
            <Button
              className="m-reply__bottom-action"
              onClick={this.handleSave}
              icon="save"
              responsive="icon-only"
              disabled={!this.state.hasChanged}
            >
              <Trans id="messages.compose.action.save">Save</Trans>
            </Button>
            {
            // XXX no api available yet
            // <Button
            //   className="m-reply__bottom-action"
            //   icon="share-alt"
            //   responsive="icon-only"
            // >
            // <Trans id="messages.compose.action.copy">Copy to</Trans>
            // </Button>
            //
            //  TODO: enable rich text editor
            // <Button
            //   className="m-new-reply__bottom-action m-reply__bottom-action--editor"
            //   icon="editor"
            //   responsive="icon-only"
            // />
            }
          </BottomRow>
        </form>
      </DiscussionDraft>
    );
  }
}

export default ReplyForm;
