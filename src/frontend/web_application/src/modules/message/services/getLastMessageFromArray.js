import { sortMessages } from './sortMessages';

export const getLastMessageFromArray = (messages) =>
  sortMessages(messages, true)[0];
