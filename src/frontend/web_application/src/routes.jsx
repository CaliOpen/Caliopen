import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslator } from '@gandi/react-translate';
import { SwitchWithRoutes } from './modules/routing';
import Signin from './scenes/Signin';
import Signup from './scenes/Signup';
import ForgotPassword from './scenes/ForgotPassword';
import ResetPassword from './scenes/ResetPassword';
import Contact from './scenes/Contact';
import AuthPage from './layouts/AuthPage';
import Page from './layouts/Page2';
import Settings from './layouts/Settings';
import Timeline from './scenes/Timeline2';
import NewDraft from './scenes/NewDraft';
import SearchResults from './scenes/SearchResults';
import User from './layouts/User';
import UserProfile from './scenes/UserProfile';
import UserSecurity from './scenes/UserSecurity';
import UserPrivacy from './scenes/UserPrivacy';
import RemoteIdentitySettings from './scenes/RemoteIdentitySettings';
// import SettingsSignatures from './scenes/SettingsSignatures';
import ApplicationSettings from './scenes/ApplicationSettings';
import Tags from './scenes/TagsSettings';
import MessageList from './scenes/MessageList';
import ContactBook from './scenes/ContactBook2';
import PageNotFound from './scenes/PageNotFound';
import DevicesSettings from './scenes/DevicesSettings';
import NewDeviceInfo from './scenes/NewDeviceInfo';

export const getRouteConfig = ({ __ }) => [
  {
    path: '/auth',
    component: AuthPage,
    app: 'auth',
    routes: [
      { path: '/auth/', exact: true, redirect: '/auth/signin' },
      { path: '/auth/signin', component: Signin },
      { path: '/auth/signup', component: Signup },
      { path: '/auth/forgot-password', component: ForgotPassword },
      { path: '/auth/passwords/reset/:key', component: ResetPassword },
      { path: '/auth/signout', redirect: '/auth/signin' },
    ],
  },
  {
    path: '/',
    component: Page,
    routes: [
      {
        path: '/',
        exact: true,
        component: Timeline,
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
        path: '/new-contact',
        component: Contact,
        app: 'contact',
      },
      {
        path: '/search-results',
        component: SearchResults,
        app: 'discussion',
      },
      {
        path: '/user',
        app: 'user',
        component: User,
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
        app: 'settings',
        component: Settings,
        label: __('settings.route.label.default'),
        routes: [
          {
            path: '/settings/identities',
            component: RemoteIdentitySettings,
            label: __('settings.route.label.identities'),
          },
          {
            path: '/settings/application',
            component: ApplicationSettings,
            label: __('settings.route.label.application'),
          },
          {
            path: '/settings/tags',
            component: Tags,
            label: __('settings.route.label.tags'),
          },

          // TODO: enable devices when API ready: https://tree.taiga.io/project/caliopen-caliopen/us/314?no-milestone=1
          {
            path: '/settings/devices',
            label: __('settings.route.label.devices'),
            component: DevicesSettings,
          },
          {
            path: '/settings/new-device',
            label: __('settings.route.label.devices'),
            component: NewDeviceInfo,
          },

          // TODO: enable signatures
          // {
          //  path: '/settings/signatures',
          //  component: SettingsSignatures,
          //  label: __('settings.route.label.signatures'),
          // },
        ],
      },
      {
        component: PageNotFound,
      },
    ],
  },
  {
    component: PageNotFound,
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

class Routes extends Component {
  static propTypes = {
    __: PropTypes.func.isRequired,
  };
  static defaultProps = {
  };

  render() {
    const { __ } = this.props;

    return (
      <SwitchWithRoutes routes={getRouteConfig({ __ })} />
    );
  }
}

export default withTranslator()(Routes);
