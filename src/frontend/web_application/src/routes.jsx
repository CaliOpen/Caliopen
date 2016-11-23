import React from 'react';
import { Route, IndexRoute } from 'react-router';
import { provideTranslate, createTranslator } from '@gandi/react-translate';
import Page from './components/Page';
import Discussions from './scenes/Discussions';
import ContactList from './scenes/ContactList';

const translatorParams = {
  translations: {       // catalog
    'This is a test %(username)s!': 'C\'est un test %(username)s!',
    'call-to-action.action.compose': 'Compose',
    'call-to-action.action.create_contact': 'Contact',
  },
  locale: 'fr',         // user's locale
  utcOffset: 0,         // user's zone offset
  defaultLocale: 'en',  // default application locale
  logMissing: false,    // display warnings when translations are missing (except on production)
  localeData: {         // Config for TODO
    locale: 'fr',
    number: {
      currencies: {
        USD: '$US',
        EUR: '€',
      },
    },
  },
};

const translator = createTranslator(translatorParams);
const App = provideTranslate(translator)(Page);

const routes = (
  <Route name="app" path="/" component={App} >
    <IndexRoute component={Discussions} />
    <Route path="contacts" component={ContactList} />
  </Route>
);


export default routes;
