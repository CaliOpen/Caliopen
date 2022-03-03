import { withI18nProps } from '@lingui/react';

export const validateRequired = (i18n: withI18nProps['i18n']) => (
  value: string
): string | undefined => {
  if (!value) {
    return i18n._('form-validation.required', undefined, {
      defaults: 'Required',
    });
  }

  return undefined;
};
