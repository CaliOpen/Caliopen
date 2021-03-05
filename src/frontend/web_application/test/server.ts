import { setupServer } from 'msw/node';
import { userHandlers } from './msw-handlers/user';
import { settingsHandlers } from './msw-handlers/settings';

export const server = setupServer(...userHandlers, ...settingsHandlers);

server.listen({
  onUnhandledRequest: 'warn',
});
