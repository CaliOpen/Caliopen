import * as React from 'react';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import { getBestLocale } from '../services/getBestLocale';
import { getLanguage } from '../services/getLanguage';

function getCatalogSync(language: string) {
  // eslint-disable-next-line global-require, import/no-dynamic-require, @typescript-eslint/no-var-requires
  const { messages } = require(`locale/${language}/messages.ts`);

  return messages;
}

async function getCatalog(language) {
  const { messages } = await import(
    /* webpackMode: "lazy", webpackChunkName: "i18n-[index]" */ `locale/${language}/messages.ts`
  );

  return messages;
}

const getBestLanguage = (locale: string) =>
  getLanguage(getBestLocale([locale]));

i18n.load('en', getCatalogSync('en'));
i18n.activate('en');

interface Props {
  locale: string;
  children: React.ReactNode;
}
function I18nLoader({
  locale,
  children,
}: Props): React.ReactElement<typeof I18nProvider> {
  React.useEffect(() => {
    (async () => {
      const language = getBestLanguage(locale);
      i18n.load(language, await getCatalog(language));
      i18n.activate(language);
    })();
  }, [locale]);

  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
}

export default I18nLoader;
