import { Message } from 'src/modules/message';
import { MessageEncryptionStatus } from 'src/store/modules/encryption';

export interface ConcreteMessageProps {
  message: Message;
  onDeleteMessageSuccess: () => any;
  onOpenTags: () => any;
  onReply: () => any;
  noInteractions?: boolean;
  isLocked: boolean;
  encryptionStatus: MessageEncryptionStatus;
  // scrollToMe
  forwardedRef: React.MutableRefObject<any>;
}
