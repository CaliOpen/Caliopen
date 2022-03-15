import * as React from 'react';
import { Trans, withI18n, withI18nProps } from '@lingui/react';
import { useDispatch, useSelector } from 'react-redux';
import VisibilitySensor from 'react-visibility-sensor';
import { useHistory } from 'react-router-dom';
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
import { reply } from 'src/modules/draftMessage';
import { useSettings } from 'src/modules/settings';
import { useScrollToMe } from 'src/modules/scroll';
import { RootState } from 'src/store/reducer';
import MailMessage from './MailMessage';
import InstantMessage from './InstantMessage';

type ManageEntityTagsProps = React.ComponentProps<typeof ManageEntityTags>;

interface Props extends withI18nProps {
  message: MessageClass;
  scrollToMe: () => string;
  noInteractions?: boolean;
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
  const encryptionStatus = useSelector<RootState>((state) =>
    messageEncryptionStatusSelector(state, message.message_id)
  );
  // @ts-ignore
  const isDecrypted = encryptionStatus?.status === STATUS_DECRYPTED;
  const hasEncryption = isMessageEncrypted(message);
  const isLocked = hasEncryption && !isDecrypted;
  const isMail = !message.protocol || message.protocol === 'email';
  // @ts-ignore
  const decryptedMessage = encryptionStatus?.decryptedMessage;

  const onVisibilityChange = (isVisible) => {
    if (!isLocked && isVisible && message.is_unread) {
      dispatch(setMessageRead({ message, isRead: true }));
    }
  };

  const handleTagsChange: ManageEntityTagsProps['onChange'] = async (tags) => {
    dispatch(
      updateTagCollection(i18n, { type: 'message', entity: message, tags })
    );
  };

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
    const draft = (await dispatch(reply(message))) as any as MessageClass;
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
            message={hasEncryption && !isLocked ? decryptedMessage : message}
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
            message={hasEncryption && !isLocked ? decryptedMessage : message}
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
            contentLabel={i18n._(/* i18n */ 'tags.header.label', undefined, {
              message: 'Tags',
            })}
            title={
              <Trans
                id="tags.header.title"
                message="Tags <0>(Total: {nb})</0>"
                values={{ nb: message.tags ? message.tags.length : 0 }}
                components={[<span className="m-tags-form__count" />]}
              />
            }
            onClose={handleCloseTags}
          >
            <ManageEntityTags entity={message} onChange={handleTagsChange} />
          </Modal>
        )}
      </>
    </VisibilitySensor>
  );
}

export default withI18n()(Message);
