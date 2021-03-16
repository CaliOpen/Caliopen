import { AVAILABLE_LOCALES } from 'src/modules/i18n';

export interface Settings {
  default_locale: typeof AVAILABLE_LOCALES[number];
  message_display_format: 'rich_text';
  contact_display_format: 'given_name, family_name';
  contact_display_order: 'given_name';
  notification_enabled: boolean;
  notification_message_preview: 'always';
  notification_sound_enabled: boolean;
  notification_delay_disappear: number;
  notification_delay_disappear_unit: 's';
}
