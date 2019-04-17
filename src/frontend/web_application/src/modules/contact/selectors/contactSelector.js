import { getModuleStateSelector } from '../../../store/selectors/getModuleStateSelector';

export const contactSelector = (state, { contactId }) => (
  getModuleStateSelector('contact')(state).contactsById[contactId]
);
