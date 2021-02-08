import { getBestLocale } from '../../../i18n';

export const getDefaultSettings = (locales) => ({
  default_locale: getBestLocale(locales),
  message_display_format: 'rich_text',
  contact_display_format: 'given_name, family_name',
  contact_display_order: 'given_name',
  notification_enabled: true,
  notification_message_preview: 'always',
  notification_sound_enabled: false,
  notification_delay_disappear: 10,
  notification_delay_disappear_unit: 's',
});
