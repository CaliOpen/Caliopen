import { provideTranslate, negociateLocale, createTranslator } from '@gandi/react-translate';

const availableTranslations = {
  /* eslint-disable global-require */
  en: require('../../locales/en/main.json'),
  fr: require('../../locales/fr/main.json'),
  /* eslint-enable global-require */
};
const defaultLocale = 'en';

export function changeLocale(translator, locale) {
  translator.registerTranslations(locale, availableTranslations[locale]);
  translator.setLocale(locale);
}

export function getLocale() {
  let preferedUserLocales = [];

  if (BUILD_TARGET === 'browser') {
    preferedUserLocales = [
      document.cookie.locale,
      ...window.navigator.languages,
      (window.navigator.language || window.navigator.userLanguage),
    ].filter(rawLocale => rawLocale);
  }

  if (BUILD_TARGET === 'server') {
    preferedUserLocales = [global.USER_LOCALE];
  }

  if (BUILD_TARGET === 'electron') {
    const { ipcRenderer } = require('electron'); // eslint-disable-line
    preferedUserLocales = [ipcRenderer.sendSync('getLocale')];
  }

  return negociateLocale(preferedUserLocales, Object.keys(availableTranslations), defaultLocale);
}

function getLocaleAsync() {
  const promise = new Promise((resolve, reject) => {
    if (BUILD_TARGET === 'cordova') {
      navigator.globalization.getLocaleName((locale) => {
        resolve(negociateLocale([locale.value], Object.keys(availableTranslations), defaultLocale));
      }, (err) => {
        reject(err);
      });
    } else {
      resolve(getLocale());
    }
  });

  return promise;
}

export default function enableI18n(Component) {
  const locale = getLocale();
  const translatorParams = {
    locale,
    translations: availableTranslations[locale],
    defaultLocale: locale,
    logMissing: true,
  };

  const translator = createTranslator(translatorParams);

  if (BUILD_TARGET === 'cordova') {
    getLocaleAsync().then((localeUpdated) => {
      changeLocale(translator, localeUpdated);
    });
  }

  return provideTranslate(translator)(Component);
}
