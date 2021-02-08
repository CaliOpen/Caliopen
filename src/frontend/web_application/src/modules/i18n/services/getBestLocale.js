import { getLanguage } from './getLanguage';

export const DEFAULT_LOCALE = 'en_US';
export const AVAILABLE_LOCALES = [DEFAULT_LOCALE, 'fr_FR', 'de_DE'];
export const getBestLocale = (locales = []) => {
  const bestLocale = locales.reduce((acc, locale) => {
    if (acc) {
      return acc;
    }
    if (AVAILABLE_LOCALES.includes(locale)) {
      return locale;
    }

    const currentLocale = AVAILABLE_LOCALES.find((availableLang) =>
      locale.startsWith(getLanguage(availableLang))
    );

    if (currentLocale) {
      return currentLocale;
    }

    return acc;
  }, undefined);

  return bestLocale || DEFAULT_LOCALE;
};
