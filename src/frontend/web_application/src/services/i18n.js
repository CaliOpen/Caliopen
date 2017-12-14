import { provideTranslate, createTranslator } from '@gandi/react-translate';

const availableTranslations = {
  /* eslint-disable global-require */
  de: require('../../locales/de/main.json'),
  en: require('../../locales/en/main.json'),
  fr: require('../../locales/fr/main.json'),
  /* eslint-enable global-require */
};
export const availableLanguages = Object.keys(availableTranslations);
export const defaultLanguage = 'en';

export function changeLocale(translator, language) {
  translator.registerTranslations(language, availableTranslations[language]);
  translator.setLocale(language);
}

export const getUserLocales = () => {
  if (BUILD_TARGET === 'browser') {
    const languages = window.navigator.languages || [];

    return [
      ...languages,
      ...(window.navigator.language || window.navigator.userLanguage || defaultLanguage),
    ];
  }

  if (BUILD_TARGET === 'server' && global.USER_LOCALE) {
    return [global.USER_LOCALE];
  }

  if (BUILD_TARGET === 'electron') {
    const { ipcRenderer } = require('electron'); // eslint-disable-line

    return [ipcRenderer.sendSync('getLocale')];
  }

  return [];
};

export const getLanguage = (locales = []) => {
  const language = locales.reduce((acc, locale) => {
    if (acc) {
      return acc;
    }
    if (availableLanguages.indexOf(locale) !== -1) {
      return locale;
    }

    const lang = availableLanguages.find(availableLang => locale.startsWith(availableLang));

    if (lang) {
      return lang;
    }

    return acc;
  }, undefined);

  return language || defaultLanguage;
};

export const getLocaleAsync = () => new Promise((resolve, reject) => {
  if (BUILD_TARGET === 'cordova') {
    navigator.globalization.getLocaleName((locale) => {
      resolve(getLanguage([locale.value]));
    }, (err) => {
      reject(err);
    });
  }

  resolve(getLanguage(getUserLocales()));
});

let translator;
export const getTranslator = () => {
  if (!translator) {
    const language = getLanguage(getUserLocales());
    const translatorParams = {
      locale: language,
      translations: availableTranslations[language],
      defaultLocale: language,
      logMissing: true,
    };
    translator = createTranslator(translatorParams);
  }

  return translator;
};

export default function enableI18n(Component) {
  const currentTranslator = getTranslator();

  if (BUILD_TARGET === 'cordova') {
    getLocaleAsync().then((language) => {
      changeLocale(currentTranslator.translator, language);
    });
  }

  return provideTranslate(currentTranslator)(Component);
}
