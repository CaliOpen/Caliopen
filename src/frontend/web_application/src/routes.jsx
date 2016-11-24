import React from 'react';
import { Route, IndexRoute } from 'react-router';
import Page from './components/Page';
import Discussions from './scenes/Discussions';
import ContactList from './scenes/ContactList';
import enableI18n from './services/i18n';

const getRoutes = () => (
  <Route name="app" path="/" component={enableI18n(Page)} >
    <IndexRoute component={Discussions} />
    <Route path="contacts" component={ContactList} />
  </Route>
);

export default getRoutes;
