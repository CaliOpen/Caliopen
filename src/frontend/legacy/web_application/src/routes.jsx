import React from 'react';
import { Route, IndexRoute } from 'react-router';
import Page from './components/Page';
import Discussions from './scenes/Discussions';
import ContactList from './scenes/ContactList';

const routes = (
  <Route path="/" component={Page} >
    <IndexRoute component={Discussions} />
    <Route path="contacts" component={ContactList} />
  </Route>
);

export default routes;
