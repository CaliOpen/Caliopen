import { setupServer } from 'msw/node';
import { settingsHandlers } from './msw-handlers/settings';
import { contactsHandlers } from './msw-handlers/contacts';
import { tagsHandlers } from './msw-handlers/tags';
import { userHandlers } from './msw-handlers/user';

export const server = setupServer(
  ...contactsHandlers,
  ...settingsHandlers,
  ...tagsHandlers,
  ...userHandlers
);
