import { Message } from 'src/modules/message';
import { MessageEncryptionStatus } from 'src/store/modules/encryption';

export interface ConcreteMessageProps {
  message: Message;
  onDeleteMessageSuccess: () => any;
  onOpenTags: () => any;
  onReply: () => any;
  noInteractions?: boolean;
  isLocked: boolean;
  encryptionStatus: void | MessageEncryptionStatus;
  // scrollToMe
  forwardedRef: React.MutableRefObject<any>;
}
