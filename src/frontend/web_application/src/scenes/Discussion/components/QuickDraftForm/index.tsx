import * as React from 'react';
import classnames from 'classnames';
import { withI18n, Trans } from '@lingui/react';
import type { I18n } from '@lingui/core';
import { compose } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useCurrentTab, useCloseTab } from 'src/modules/tab';
import { IDraftMessageFormData } from 'src/modules/draftMessage/types';
import { useScrollToMe } from 'src/modules/scroll';
import {
  Button,
  Spinner,
  FieldErrors,
  Link,
  PlaceholderBlock,
} from '../../../../components';

import {
  LockedMessage,
  messageEncryptionStatusSelector,
} from '../../../../modules/encryption';
import {
  discussionDraftSelector,
  getOrCreateDiscussionDraft,
  saveDraft,
  validate,
  sendDraft,
} from '../../../../modules/draftMessage';
import { messageSelector } from '../../../../modules/message';
import { notifyError } from '../../../../modules/userNotify';

import { isMessageEncrypted } from '../../../../services/encryption';
import {
  STATUS_DECRYPTED,
  STATUS_ERROR,
} from '../../../../store/modules/encryption';

import ToggleAdvancedFormButton from './components/ToggleAdvancedFormButton';
import './draft-message-quick.scss';
import { useAvailableIdentities } from 'src/modules/draftIdentity';
import { RootState } from 'src/store/reducer';
import { AppDispatch } from 'src/types';

export const KEY = {
  ENTER: 13,
};

function useDraftMessage(
  discussionId: string
): undefined | IDraftMessageFormData {
  const dispatch = useDispatch();
  const draftMessage = useSelector((state: RootState) =>
    discussionDraftSelector(state, discussionId)
  );
  React.useEffect(() => {
    if (!draftMessage) {
      dispatch(getOrCreateDiscussionDraft({ discussionId }));
    }
  }, [draftMessage]);

  return draftMessage;
}
interface QuickDraftFormProps {
  // injected props
  i18n: I18n;
  // ownProps
  encryptionChildren?: React.ReactNode;
  className?: string;
  innerRef: React.Ref<HTMLDivElement>;
  onFocus: any;
  discussionId: string;
}

function QuickDraftForm({
  i18n,
  encryptionChildren = null,
  className = undefined,
  innerRef,
  onFocus,
  discussionId,
}: QuickDraftFormProps) {
  const ref = useScrollToMe('#reply', { focusable: true });
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const draftMessage = useDraftMessage(discussionId);
  const message = useSelector(
    (state) =>
      draftMessage &&
      messageSelector(state, { messageId: draftMessage.message_id })
  );

  const closeTab = useCloseTab();
  const tab = useCurrentTab();
  const history = useHistory();

  const availableIdentities = useAvailableIdentities(draftMessage);

  const draftEncryption = useSelector(
    (state) =>
      draftMessage &&
      messageEncryptionStatusSelector(state, draftMessage.message_id)
  );
  const isEncrypted = message && isMessageEncrypted(message);

  const isLocked =
    isEncrypted &&
    ![STATUS_DECRYPTED, STATUS_ERROR].includes(draftEncryption.status);
  const encryptionEnabled =
    isEncrypted && draftEncryption.status === STATUS_DECRYPTED;

  const handleChange = (ev) => {
    if (!draftMessage) {
      return;
    }

    const { name, value } = ev.target;
    dispatch(
      saveDraft(
        {
          ...draftMessage,
          [name]: value,
        },
        { withThrottle: true }
      )
    );
  };

  const getRecipientList = () => {
    // participants may not be present when the draft is new, it is the responsibility of the
    // backend to calculate what will be the participants for a reply
    if (!draftMessage || !draftMessage.recipients) {
      return null;
    }

    const { recipients } = draftMessage;

    if (!recipients) {
      return '';
    }

    if (recipients.length > 3) {
      return recipients
        .map((recipient) => recipient.address)
        .join(', ')
        .concat('...');
    }

    return recipients.map((recipient) => recipient.address).join(', ');
  };

  const getQuickInputPlaceholder = () => {
    if (!draftMessage) {
      return undefined;
    }
    const { identifier } =
      availableIdentities.find(
        (identity) => identity.identity_id === draftMessage.identity_id
      ) || {};

    const recipientsList = getRecipientList();

    if (draftMessage && recipientsList && identifier) {
      return i18n._(
        'draft-message.form.placeholder.quick-reply',
        { recipients: recipientsList, protocol: identifier },
        { defaults: 'Quick reply to {recipients} from {protocol}' }
      );
    }

    if (draftMessage && identifier) {
      return i18n._(
        'draft-message.form.placeholder.quick-reply-no-recipients',
        { identifier },
        { defaults: 'Quick reply from {identifier}' }
      );
    }

    return i18n._('draft-message.form.placeholder.quick-start', undefined, {
      defaults: 'Start a new discussion',
    });
  };

  const handleSend = async (ev) => {
    ev.preventDefault();
    setIsSending(true);

    if (!draftMessage) {
      return;
    }

    try {
      const savedMessage = await dispatch(
        saveDraft(draftMessage, {
          withThrottle: false,
        })
      );
      // @ts-ignore: probably related to middlewares typings
      await dispatch(sendDraft(savedMessage));

      setIsSending(false);
    } catch (err) {
      dispatch(
        notifyError({
          message: i18n._('draft.feedback.send-error', undefined, {
            defaults: 'Unable to send the message',
          }),
        })
      );
      setIsSending(false);
    }
  };

  const handlePressSendShortKey = (ev) => {
    const { which: keyCode, ctrlKey } = ev;
    if (keyCode === KEY.ENTER && ctrlKey) {
      ev.preventDefault();
      handleSend(ev);
    }
  };

  const handleClickToggleAdvanced = async () => {
    if (!draftMessage) {
      return;
    }
    setIsSaving(true);
    try {
      await dispatch(saveDraft(draftMessage));
      history.push(`/messages/${draftMessage.message_id}#compose`);
      closeTab(tab);
    } catch (err) {
      setIsSaving(false);
    }
  };

  // TODO: isLoaded & isLocked
  if (!draftMessage) {
    // const ref = (el) => {
    //   innerRef(el);
    //   forwardRef(el);
    // };

    return (
      <div ref={innerRef}>
        <PlaceholderBlock
          className={classnames(className, 'm-draft-message-placeholder')}
        />
      </div>
    );
  }

  const errors = validate({ draftMessage, i18n, availableIdentities });
  if (errors.length) {
    return (
      <div className="m-quickdraft-errors" ref={innerRef}>
        <FieldErrors errors={errors} />
        <p>
          <Trans
            id="draft-message.action.fix-error-on-advanced-form"
            defaults="Unable to send the message, you can fix it or delete it in the <0>Advanced form</0>"
            components={[<Link to={`/messages/${draftMessage.message_id}`} />]}
          />
        </p>
      </div>
    );
  }

  const canSend = !isSending && draftMessage.body.length > 0;

  return (
    // eslint-disable-next-line react/jsx-filename-extension
    <div className={classnames(className, 'm-draft-message-quick')}>
      <form onSubmit={handleSend}>
        <div
          className={classnames(className, 'm-draft-message-quick__container')}
        >
          <div className="m-draft-message-quick__toggle-advanced">
            <ToggleAdvancedFormButton
              handleToggleAdvancedForm={handleClickToggleAdvanced}
              hasActivity={isSaving}
            />
          </div>
          {isLocked ? (
            <LockedMessage encryptionStatus={draftEncryption} />
          ) : (
            <textarea
              // @ts-ignore
              ref={ref}
              rows={/\n+/.test(draftMessage.body) ? 7 : 1}
              className={classnames('m-draft-message-quick__input', {
                'm-draft-message-quick__input--encrypted': encryptionEnabled,
              })}
              onChange={handleChange}
              onFocus={onFocus}
              onKeyPress={handlePressSendShortKey}
              name="body"
              value={draftMessage.body}
              placeholder={getQuickInputPlaceholder()}
            />
          )}
          <div
            className={classnames('m-draft-message-quick__send', {
              'm-draft-message-quick__send--encrypted': encryptionEnabled,
              'm-draft-message-quick__send--unencrypted': !encryptionEnabled,
            })}
          >
            <Button
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              type="submit"
              display="expanded"
              shape="plain"
              icon={
                isSending ? <Spinner loading display="block" /> : 'paper-plane'
              }
              title={i18n._('draft-message.action.send', undefined, {
                defaults: 'Send',
              })}
              className={classnames('m-draft-message-quick__send-button', {
                'm-draft-message-quick__send-button--encrypted': encryptionEnabled,
                'm-draft-message-quick__send-button--unencrypted': !encryptionEnabled,
              })}
              disabled={!canSend}
            />
          </div>
        </div>
        <div className="m-draft-message-quick__encryption">
          {encryptionChildren}
        </div>
      </form>
    </div>
  );
}

export default compose(
  withI18n()
  // @ts-ignore: can be fixed with compose(...[hoc,]) but then fails in forwardRef
)(QuickDraftForm);
