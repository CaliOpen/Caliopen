import * as React from 'react';
import { Trans, withI18n } from '@lingui/react';
import { I18n } from '@lingui/core';
import { useDispatch, useSelector } from 'react-redux';
import VisibilitySensor from 'react-visibility-sensor';
import { useHistory } from 'react-router';
import { Modal } from 'src/components';
import { isMessageEncrypted } from 'src/services/encryption';
import { STATUS_DECRYPTED } from 'src/store/modules/encryption';
import { messageEncryptionStatusSelector } from 'src/modules/encryption';
import {
  Message as MessageClass,
  setMessageRead,
  deleteMessage,
} from 'src/modules/message';
import { ManageEntityTags, updateTagCollection } from 'src/modules/tags';
import { Router } from 'react-router-dom';
import { reply } from 'src/modules/draftMessage';
import { useSettings } from 'src/modules/settings';
import { useScrollToMe } from 'src/modules/scroll';
import MailMessage from './MailMessage';
import InstantMessage from './InstantMessage';

interface Props {
  message: MessageClass;
  scrollToMe: Function;
  noInteractions?: boolean;
  // injected
  i18n: I18n;
  onDeleteMessageSuccess: () => any;
}

function Message({
  message,
  i18n,
  noInteractions,
  onDeleteMessageSuccess,
}: Props) {
  const history = useHistory();
  const dispatch = useDispatch();
  const ref = useScrollToMe(`#${message.message_id}`);
  const [isTagModalOpen, setTagModalOpen] = React.useState(false);

  const settings = useSettings();
  const encryptionStatus = useSelector((state) =>
    messageEncryptionStatusSelector(state, message.message_id)
  );
  const isDecrypted = encryptionStatus?.status === STATUS_DECRYPTED;
  const isLocked = isMessageEncrypted(message) && !isDecrypted;
  const isMail = !message.protocol || message.protocol === 'email';

  const onVisibilityChange = (isVisible) => {
    if (!isLocked && isVisible && message.is_unread) {
      dispatch(setMessageRead({ message, isRead: true }));
    }
  };

  const handleTagsChange = async ({ tags }) => dispatch(
      updateTagCollection(i18n, { type: 'message', entity: message, tags })
    );

  const handleOpenTags = () => {
    setTagModalOpen(true);
  };

  const handleCloseTags = () => {
    setTagModalOpen(false);
  };

  // XXX: move to direct comp
  const handleDeleteMessage = async () => {
    await dispatch(deleteMessage({ message }));
    onDeleteMessageSuccess();
  };

  const handleReplyMessage = async () => {
    const draft = ((await dispatch(reply(message))) as any) as MessageClass;
    history.push(`/messages/${draft.message_id}`);
  };

  const handleReadMessage = () => {
    dispatch(setMessageRead({ message, isRead: true }));
  };

  const handleUnreadMessage = () => {
    dispatch(setMessageRead({ message, isRead: false }));
  };

  return (
    <VisibilitySensor
      // @ts-ignore: actually : void|false|string
      partialVisibility="bottom"
      onChange={onVisibilityChange}
      scrollCheck
      scrollThrottle={2000}
    >
      <>
        {isMail ? (
          <MailMessage
            forwardedRef={ref}
            message={message}
            settings={settings}
            onOpenTags={handleOpenTags}
            onCloseTags={handleCloseTags}
            onTagsChange={handleTagsChange}
            onMessageDelete={handleDeleteMessage}
            onMessageRead={handleReadMessage}
            onMessageUnread={handleUnreadMessage}
            onReply={handleReplyMessage}
            isLocked={isLocked}
          />
        ) : (
          <InstantMessage
            forwardedRef={ref}
            message={message}
            onOpenTags={handleOpenTags}
            onCloseTags={handleCloseTags}
            onTagsChange={handleTagsChange}
            onMessageDelete={handleDeleteMessage}
            onMessageRead={handleReadMessage}
            onMessageUnread={handleUnreadMessage}
            onReply={handleReplyMessage}
          />
        )}
        {!noInteractions && (
          <Modal
            isOpen={isTagModalOpen}
            contentLabel={i18n._('tags.header.label', undefined, {
              defaults: 'Tags',
            })}
            title={
              <Trans
                id="tags.header.title"
                defaults={'Tags <0>(Total: {nb})</0>'}
                values={{ nb: message.tags ? message.tags.length : 0 }}
                components={[<span className="m-tags-form__count" />]}
              />
            }
            onClose={handleCloseTags}
          >
            <ManageEntityTags
              type="message"
              entity={message}
              onChange={handleTagsChange}
            />
          </Modal>
        )}
      </>
    </VisibilitySensor>
  );
}

export default withI18n()(Message);
