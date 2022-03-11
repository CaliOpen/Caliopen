import { withI18nProps } from '@lingui/react';

export const validateRequired =
  (i18n: withI18nProps['i18n']) =>
  (value: string): string | undefined => {
    if (!value) {
      return i18n._(/* i18n */ 'form-validation.required', undefined, {
        message: 'Required',
      });
    }

    return undefined;
  };
