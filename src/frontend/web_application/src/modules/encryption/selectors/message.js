export function encryptionSelector(state) {
  return state.encryption;
}

export function messageEncryptionStatusesSelector(state) {
  return encryptionSelector(state).messageEncryptionStatusById;
}

export function messageEncryptionStatusSelector(state, messageId) {
  return messageEncryptionStatusesSelector(state)[messageId];
}
