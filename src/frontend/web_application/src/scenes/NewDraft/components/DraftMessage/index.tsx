import * as React from 'react';
import classnames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { Trans, withI18n, withI18nProps } from '@lingui/react';
import {
  Button,
  Icon,
  TextareaFieldGroup,
  TextFieldGroup,
  Link,
  Confirm,
  FieldErrors,
  Spinner,
  TextBlock,
} from 'src/components';
import {
  deleteDraft,
  deleteDraftSuccess,
  clearDraft,
  syncDraft,
} from 'src/store/modules/draft-message';
import { STATUS_DECRYPTED, STATUS_ERROR } from 'src/store/modules/encryption';
import {
  saveDraft,
  sendDraft,
  draftMessageSelector,
  AttachmentManager,
  validate,
  getOrCreateDraft,
  DraftMessageFormData,
} from 'src/modules/draftMessage';
import { calcSyncDraft } from 'src/modules/draftMessage/services/calcSyncDraft';
import { getIdentityProtocol } from 'src/modules/draftMessage/services/getIdentityProtocol';
import { LockedMessage } from 'src/modules/encryption';
import {
  uploadDraftAttachments,
  deleteDraftAttachment,
} from 'src/modules/file';
import {
  deleteMessage,
  PROTOCOL_EMAIL,
  messageSelector,
  Message,
} from 'src/modules/message';
import { notifyError } from 'src/modules/userNotify';
import { messageEncryptionStatusSelector } from 'src/modules/encryption/selectors/message';
import { IIdentity } from 'src/modules/identity/types';
import { isMessageEncrypted } from 'src/services/encryption';
import { useAvailableIdentities } from 'src/modules/draftIdentity';
import { RootState } from 'src/store/reducer';
import IdentitySelector from './components/IdentitySelector';
import Recipients from './components/Recipients';
import './draft-message-advanced.scss';
import './draft-message-placeholder.scss';

function useDraftMessage(messageId: string): DraftMessageFormData | undefined {
  const dispatch = useDispatch();
  const draftMessage = useSelector((state: RootState) =>
    draftMessageSelector(state, messageId)
  );
  React.useEffect(() => {
    if (!draftMessage) {
      dispatch(getOrCreateDraft(messageId));
    }
  }, [draftMessage]);

  return draftMessage;
}

const onDeleteMessage =
  ({ message }) =>
  async (dispatch) => {
    dispatch(deleteDraft({ draft: message }));
    const result = await dispatch(deleteMessage({ message }));

    await dispatch(clearDraft({ draft: message }));
    dispatch(deleteDraftSuccess({ draft: message }));

    return result;
  };

const uploadAttachments = (draft, attachments) => async (dispatch) => {
  try {
    const savedDraft = await dispatch(
      saveDraft(draft, {
        withThrottle: false,
        force: true,
      })
    );

    const messageUpTodate = await dispatch(
      uploadDraftAttachments({
        message: savedDraft,
        attachments,
      })
    );
    const nextDraft = calcSyncDraft(draft, messageUpTodate);

    return dispatch(syncDraft(nextDraft));
  } catch (err) {
    return Promise.reject(err);
  }
};

const deleteAttachement = (draft, attachment) => async (dispatch) => {
  try {
    const savedDraft = await dispatch(
      saveDraft(draft, {
        withThrottle: false,
        force: true,
      })
    );

    const messageUpTodate = await dispatch(
      deleteDraftAttachment({
        message: savedDraft,
        attachment,
      })
    );

    const nextDraft = calcSyncDraft(draft, messageUpTodate);

    return dispatch(syncDraft(nextDraft));
  } catch (err) {
    return Promise.reject(err);
  }
};

const onSendDraft = (draft) => async (dispatch) => {
  try {
    const savedMessage = await dispatch(
      saveDraft(draft, {
        withThrottle: false,
      })
    );
    // discussion_id is set after the message has been sent for new drafts
    const messageUpToDate = await dispatch(sendDraft(savedMessage));

    return messageUpToDate;
  } catch (err) {
    return Promise.reject(err);
  }
};

function isSubjectSupported(
  availableIdentities,
  draft: DraftMessageFormData
): boolean {
  if (!draft.identity_id) {
    return false;
  }

  const currIdentity = availableIdentities.find(
    (ident) => ident.identity_id === draft.identity_id
  );

  if (!currIdentity) {
    return false;
  }

  return getIdentityProtocol(currIdentity) === PROTOCOL_EMAIL;
}

interface DraftMessageProps extends withI18nProps {
  scrollToMe?: () => string;
  className?: string;
  messageId: string;
  onDeleteMessageSuccessfull: () => void;
  onSent: (message: Message) => void;
}

function DraftMessage(props: DraftMessageProps) {
  const { className, messageId, i18n, onDeleteMessageSuccessfull, onSent } =
    props;
  const [isSending, setIsSending] = React.useState(false);
  const dispatch = useDispatch();
  const draftMessageFormData = useDraftMessage(messageId);
  const message = useSelector((state) => messageSelector(state, { messageId }));
  const availableIdentities = useAvailableIdentities(draftMessageFormData);
  const parentMessage = useSelector(
    (state) =>
      draftMessageFormData &&
      messageSelector(state, { messageId: draftMessageFormData.parent_id })
  );
  const hasSubject =
    draftMessageFormData &&
    isSubjectSupported(availableIdentities, draftMessageFormData);

  const identity = availableIdentities.find(
    (ident) => ident.identity_id === draftMessageFormData?.identity_id
  );
  const draftEncryption = useSelector((state: RootState) =>
    messageEncryptionStatusSelector(state, messageId)
  );

  const isEncrypted = message && isMessageEncrypted(message);

  const isLocked =
    isEncrypted &&
    draftEncryption &&
    ![STATUS_DECRYPTED, STATUS_ERROR].includes(draftEncryption.status);
  const encryptionEnabled =
    isEncrypted && draftEncryption?.status === STATUS_DECRYPTED;
  const isReply = draftMessageFormData?.parent_id && true;

  const errors =
    (draftMessageFormData &&
      validate({
        draftMessage: draftMessageFormData,
        i18n,
        availableIdentities,
      })) ||
    [];
  const isValid = (errors?.length || 0) === 0;
  const hasRecipients = (draftMessageFormData?.recipients.length || 0) > 0;

  const canSend = (isReply || hasRecipients) && !isSending && isValid;

  const handleIdentityChange = async (nextIdentity: IIdentity) => {
    if (!draftMessageFormData) {
      return undefined;
    }
    const prevIdentity = availableIdentities.find(
      (ident) => ident.identity_id === draftMessageFormData?.identity_id
    );

    let recipients;

    if (
      !isReply &&
      prevIdentity &&
      prevIdentity.protocol !== nextIdentity.protocol
    ) {
      // force protocol for all recipients
      recipients = (draftMessageFormData?.recipients || []).map(
        (participant) => ({
          ...participant,
          protocol: nextIdentity.protocol,
        })
      );
    }

    const draft = {
      ...draftMessageFormData,
      ...(recipients ? { recipients } : {}),
      identity_id: nextIdentity.identity_id,
    };

    return dispatch(saveDraft(draft, { withThrottle: true }));
  };

  const handleChange = (ev) => {
    if (!draftMessageFormData) {
      return undefined;
    }

    const { name, value } = ev.target;

    const draft = {
      ...draftMessageFormData,
      [name]: value,
    };

    return draft && dispatch(saveDraft(draft, { withThrottle: true }));
  };

  const handleFilesChange = ({ attachments }) =>
    dispatch(uploadAttachments(draftMessageFormData, attachments));

  const handleDeleteAttachement = (attachment) =>
    dispatch(deleteAttachement(draftMessageFormData, attachment));
  const handleDelete = async () => {
    await dispatch(onDeleteMessage({ message }));

    onDeleteMessageSuccessfull();
  };

  const handleSend = async (ev) => {
    ev.preventDefault();

    setIsSending(true);

    try {
      const messageToSend = await dispatch(onSendDraft(draftMessageFormData));

      // @ts-ignore
      onSent(messageToSend);
      setIsSending(false);
    } catch (err) {
      dispatch(
        notifyError({
          message: i18n._(/* i18n */ 'draft.feedback.send-error', undefined, {
            message: 'Unable to send the message',
          }),
        })
      );
      setIsSending(false);
    }
  };

  return (
    <div
      className={classnames(className, 'm-draft-message-advanced')}
      // ref={ref}
    >
      <div className="m-draft-message-advanced__container">
        <IdentitySelector
          className="m-draft-message-advanced__identity"
          identities={availableIdentities}
          identityId={draftMessageFormData?.identity_id}
          onChange={handleIdentityChange}
        />
        {draftMessageFormData && (
          <Recipients
            className="m-draft-message-advanced__recipient-list"
            draftMessage={draftMessageFormData}
            availableIdentities={availableIdentities}
          />
        )}
        {parentMessage && (
          <div className="m-draft-message-advanced__parent">
            {/* @ts-ignore */}
            <TextBlock>
              <Link
                to={`/discussions/${parentMessage.discussion_id}#${parentMessage.message_id}`}
                className="m-reply__parent-link"
              >
                <Trans
                  id="reply-form.in-reply-to"
                  values={{ 0: parentMessage.excerpt }}
                  message="In reply to: {0}"
                />
              </Link>
            </TextBlock>
          </div>
        )}
        {!parentMessage && hasSubject && (
          <TextFieldGroup
            id="draft-message_subject"
            className="m-draft-message-advanced__subject"
            display="inline"
            label={
              <Trans
                id="messages.compose.form.subject.label"
                message="Subject"
              />
            }
            inputProps={{
              name: 'subject',
              value: draftMessageFormData?.subject,
              onChange: handleChange,
              disabled: !identity,
            }}
          />
        )}
        {isLocked ? (
          <LockedMessage encryptionStatus={draftEncryption} />
        ) : (
          <TextareaFieldGroup
            className="m-draft-advanced__body"
            label={
              <Trans
                id="messages.compose.form.body.label"
                message="Type your message here..."
              />
            }
            showLabelForSR
            inputProps={{
              name: 'body',
              onChange: handleChange,
              value: draftMessageFormData?.body,
              disabled: !identity,
            }}
          />
        )}
        <AttachmentManager
          // @ts-ignore
          className="m-draft-message-advanced__attachments"
          onUploadAttachments={handleFilesChange}
          onDeleteAttachement={handleDeleteAttachement}
          message={draftMessageFormData}
          disabled={!identity}
        />
      </div>
      <div className="m-draft-message-advanced__action-send">
        {message && (
          <Confirm
            onConfirm={handleDelete}
            title={
              <Trans
                id="message-list.message.confirm-delete.title"
                message="Delete a message"
              />
            }
            content={
              <Trans
                id="message-list.message.confirm-delete.content"
                message="The deletion is permanent, are you sure you want to delete this message ?"
              />
            }
            render={(confirm) => (
              <Button
                onClick={confirm}
                icon="trash"
                color="alert"
                className="m-draft-message-advanced__action-button"
              >
                <Trans
                  id="message-list.message.action.delete"
                  message="Delete"
                />
              </Button>
            )}
          />
        )}
        <Button
          shape="plain"
          className={classnames(
            'm-draft-message-advanced__action-button',
            'm-draft-message-advanced__button-send',
            {
              'm-draft-message-advanced__button-send--encrypted':
                encryptionEnabled,
              'm-draft-message-advanced__button-send--unencrypted':
                !encryptionEnabled,
            }
          )}
          onClick={handleSend}
          disabled={!canSend}
        >
          {isSending && (
            <Spinner
              svgTitleId="send-draft-spinner"
              display="inline"
              theme="bright"
            />
          )}
          {/* @ts-ignore */}
          {!isSending && <Icon type="paper-plane" />}{' '}
          <Trans id="draft-message.action.send" message="Send" />
        </Button>
      </div>
      {errors.length > 0 && (
        <div className="m-draft-message-advanced__errors">
          <FieldErrors errors={errors} />
        </div>
      )}
      <div className="m-draft-message-advanced__encryption">
        {encryptionEnabled ? (
          <Trans
            id="draft-message.encryption.ok"
            message="This message is encrypted"
          />
        ) : (
          <Trans
            id="draft-message.encryption.ko"
            message="This message is not encrypted"
          />
        )}
      </div>
    </div>
  );
}

export default withI18n()(DraftMessage);
