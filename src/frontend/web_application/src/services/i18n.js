import { provideTranslate, createTranslator } from '@gandi/react-translate';
import { getLanguage, DEFAULT_LANGUAGE } from '../modules/i18n';

const availableTranslations = {
  /* eslint-disable global-require */
  de: require('../../locale/de/messages.json'),
  en: require('../../locale/en/messages.json'),
  fr: require('../../locale/fr/messages.json'),
  /* eslint-enable global-require */
};

// @deprecated cf.modules/i18n
export const availableLanguages = Object.keys(availableTranslations);

export function changeLocale(translator, language) {
  translator.registerTranslations(language, availableTranslations[language]);
  translator.setLocale(language);
}

export const getUserLocales = () => {
  if (BUILD_TARGET === 'browser') {
    const languages = window.navigator.languages || [];

    return [
      ...languages,
      ...(window.navigator.language || window.navigator.userLanguage || DEFAULT_LANGUAGE),
    ];
  }

  if (BUILD_TARGET === 'server' && global.USER_LOCALE) {
    return [global.USER_LOCALE];
  }

  // if (BUILD_TARGET === 'electron') {
  //   // eslint-disable-next-line
  //   const { ipcRenderer } = require('electron');
  //
  //   return [ipcRenderer.sendSync('getLocale')];
  // }

  return [];
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
