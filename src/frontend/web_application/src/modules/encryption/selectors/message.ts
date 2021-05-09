import { RootState } from 'src/store/reducer';

export function encryptionSelector(state: RootState) {
  return state.encryption;
}

export function messageEncryptionStatusesSelector(state: RootState) {
  return encryptionSelector(state).messageEncryptionStatusById;
}

export function messageEncryptionStatusSelector(
  state: RootState,
  messageId: string
) {
  return messageEncryptionStatusesSelector(state)[messageId];
}
