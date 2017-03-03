import React from 'react';
import { Route, IndexRoute } from 'react-router';
import Page from './layouts/Page';
import AuthPage from './layouts/AuthPage';
import Settings from './layouts/Settings';
import DiscussionList from './scenes/DiscussionList';
import ContactBook from './scenes/ContactBook';
import Account from './scenes/Account';
import Signin from './scenes/Signin';
import Signup from './scenes/Signup';
import Tags from './scenes/Tags';
import Devices, { Device } from './scenes/Devices';
import enableI18n from './services/i18n';

const getRoutes = () => [(
  <Route name="app" path="/" component={enableI18n(Page)} >
    <IndexRoute component={DiscussionList} />
    <Route path="contacts" component={ContactBook} />
    <Route path="settings/" component={Settings}>
      <Route path="account" component={Account} />
      <Route path="tags" component={Tags} />
      <Route path="devices" component={Devices}>
        <Route path=":deviceId" component={Device} />
      </Route>
    </Route>
  </Route>
), (
  <Route name="auth" path="/auth/" component={enableI18n(AuthPage)} >
    <Route path="signin" component={Signin} />
    <Route path="signup" component={Signup} />
  </Route>
)];

export default getRoutes;
