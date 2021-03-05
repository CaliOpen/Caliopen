import { rest } from 'msw';

export const settings = {
  default_locale: 'en-US',
  message_display_format: 'rich_text',
  contact_display_format: 'given_name, family_name',
  contact_display_order: 'given_name',
  notification_enabled: true,
  notification_message_preview: 'always',
  notification_sound_enabled: true,
  notification_delay_disappear: 10,
};

export const settingsHandlers = [
  rest.get('/api/v1/settings', (req, res, ctx) => {
    return res(ctx.json(settings), ctx.status(200));
  }),
];
