import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';
import { withTranslator } from '@gandi/react-translate';
import Contact from './scenes/Contact';
import Auth from './scenes/Auth';
import DiscussionList from './scenes/DiscussionList';
import AppRoute from './scenes/AppRoute';
import NewDraft from './scenes/NewDraft';
import UserRoute from './scenes/UserRoute';
import UserProfile from './scenes/UserProfile';
import UserSecurity from './scenes/UserSecurity';
import UserPrivacy from './scenes/UserPrivacy';
import SettingsRoute from './scenes/SettingsRoute';
import SettingsIdentities from './scenes/SettingsIdentities';
import SettingsContacts from './scenes/SettingsContacts';
import SettingsNotifications from './scenes/SettingsNotifications';
import SettingsInterface from './scenes/SettingsInterface';
import SettingsSignatures from './scenes/SettingsSignatures';
import SettingsApplicationRoute from './scenes/SettingsApplicationRoute';
import DevicesRoute from './scenes/DevicesRoute';
import MessageList from './scenes/MessageList';
import ContactBook from './scenes/ContactBook';
import Tags from './scenes/Tags';
import { Device } from './scenes/Devices';

export const getRouteConfig = ({ __ }) => [
  {
    path: '/auth',
    component: Auth,
    app: 'auth',
  },
  {
    path: '/',
    component: AppRoute,
    routes: [
      {
        path: '/',
        exact: true,
        component: DiscussionList,
        app: 'discussion',
      },
      {
        path: '/discussions/:discussionId',
        component: MessageList,
        app: 'discussion',
      },
      {
        path: '/compose',
        component: NewDraft,
        app: 'discussion',
        exact: true,
        strict: true,
      },
      {
        path: '/compose/:internalId',
        component: NewDraft,
        app: 'discussion',
      },
      {
        path: '/contacts',
        exact: true,
        component: ContactBook,
        app: 'contact',
      },
      {
        path: '/contacts/:contactId',
        component: Contact,
        app: 'contact',
      },
      {
        path: '/user',
        component: UserRoute,
        app: 'account',
        label: __('user.route.label.default'),
        routes: [
          {
            path: '/user/profile',
            component: UserProfile,
            label: __('user.route.label.profile'),
          },
          {
            path: '/user/privacy',
            component: UserPrivacy,
            label: __('user.route.label.privacy'),
          },
          {
            path: '/user/security',
            component: UserSecurity,
            label: __('user.route.label.security'),
          },
        ],
      },
      {
        path: '/settings',
        component: SettingsRoute,
        app: 'settings',
        label: __('settings.route.label.default'),
        routes: [
          {
            path: '/settings/identities',
            component: SettingsIdentities,
            label: __('settings.route.label.identities'),
          },
          {
            path: '/settings/application',
            component: SettingsApplicationRoute,
            label: __('settings.route.label.application'),
            routes: [
              {
                path: '/settings/application/interface',
                component: SettingsInterface,
              },
              {
                path: '/settings/application/contacts',
                component: SettingsContacts,
              },
              {
                path: '/settings/application/notifications',
                component: SettingsNotifications,
              },
            ],
          },
          {
            path: '/settings/tags',
            component: Tags,
            label: __('settings.route.label.tags'),
          },
          {
            path: '/settings/devices',
            component: DevicesRoute,
            label: __('settings.route.label.devices'),
            routes: [
              {
                path: '/settings/devices/:deviceId',
                component: Device,
              },
            ],
          },
          {
            path: '/settings/signatures',
            component: SettingsSignatures,
            label: __('settings.route.label.signatures'),
          },
        ],
      },
    ],
  },
];

export const flattenRouteConfig = routes => routes.reduce((acc, route) => {
  const { routes: subRoutes, ...routeConfig } = route;
  let flattened = [...acc, routeConfig];
  if (subRoutes) {
    flattened = [...flattened, ...flattenRouteConfig(subRoutes)];
  }

  return flattened;
}, []);

export const RouteWithSubRoutes = route => (
  <Route
    path={route.path}
    render={props => (
      <route.component {...props} routes={route.routes} />
    )}
  />
);

const Routes = ({ __ }) => (
  <Switch>
    {getRouteConfig({ __ }).map((route, i) => (
      <RouteWithSubRoutes key={i} {...route} />
    ))}
  </Switch>
);
Routes.propTypes = {
  __: PropTypes.func.isRequired,
};

export default withTranslator()(Routes);
