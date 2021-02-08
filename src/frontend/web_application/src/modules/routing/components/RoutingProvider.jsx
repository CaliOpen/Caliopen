import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { matchPath } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import { RoutingContext } from '../contexts/RoutingContext';
import About from '../../../scenes/About';
import Signin from '../../../scenes/Signin';
import Signup from '../../../scenes/Signup';
import ForgotPassword from '../../../scenes/ForgotPassword';
import ResetPassword from '../../../scenes/ResetPassword';
import Contact from '../../../scenes/Contact';
import ContactAssociation from '../../../scenes/ContactAssociation';
import AboutPageLayout from '../../../layouts/AboutPage';
import AuthPageLayout from '../../../layouts/AuthPage';
import PageLayout from '../../../layouts/Page';
import SettingsLayout from '../../../layouts/Settings';
import UserLayout from '../../../layouts/User';
import Timeline from '../../../scenes/Timeline';
import NewDraft from '../../../scenes/NewDraft';
import SearchResults from '../../../scenes/SearchResults';
import UserProfile from '../../../scenes/UserProfile';
import UserSecurity from '../../../scenes/UserSecurity';
// XXX: UserPrivacy not used yet
// import UserPrivacy from '../../../scenes/UserPrivacy';
import RemoteIdentitySettings from '../../../scenes/RemoteIdentitySettings';
// import SettingsSignatures from '../../../scenes/SettingsSignatures';
import ApplicationSettings from '../../../scenes/ApplicationSettings';
import Tags from '../../../scenes/TagsSettings';
import Discussion from '../../../scenes/Discussion';
import ContactBook from '../../../scenes/ContactBook';
import PageNotFound from '../../../scenes/PageNotFound';
import DevicesSettings from '../../../scenes/DevicesSettings';
import NewDeviceInfo from '../../../scenes/NewDeviceInfo';
import ValidateDevice from '../../../scenes/ValidateDevice';
import View from '../../../scenes/View';
import { renderParticipant } from '../../../services/message';
import { formatName } from '../../../services/contact';
import AuthenticatedLayout from './AuthenticatedLayout';

const tabMatchForSettings = ({ pathname }) =>
  matchPath(pathname, {
    path: '/settings/:type',
    exact: true,
    strict: false,
  });
const tabMatchRoute = ({ pathname, routeConfig }) =>
  matchPath(pathname, routeConfig);
const tabMatchPathname = ({ pathname, tab }) =>
  pathname === tab.location.pathname;
const tabMatchForContact = ({ pathname, tab, routeConfig }) =>
  tabMatchRoute({ pathname, routeConfig }) &&
  pathname.split('/edit')[0] === tab.location.pathname.split('/edit')[0];

@withI18n()
class RoutingProvider extends Component {
  static propTypes = {
    i18n: PropTypes.shape({
      _: PropTypes.func.isRequired,
    }).isRequired,
    settings: PropTypes.shape({}).isRequired,
  };

  state = {
    routes: [],
  };

  UNSAFE_componentWillMount() {
    this.initializeRoutes();
  }

  // TODO: refactor
  //    route initialization can be done by scene via root App component.
  //    it is not easy, a route injection method here cannot be used because it will re-render and
  //    so the component it self which injects the routes
  // TODO: refactor
  //    may be change the tab config to a render func because it a bit spaghetti to have tab
  //    component far away in layout. historycally a tab can be rendered diffently in sidebar on
  //    mobile or in the navbar on large screens
  initializeRoutes = () => {
    const { i18n } = this.props;
    this.setState({
      // eslint-disable-next-line react/no-unused-state
      routes: [
        {
          path: '/about',
          component: AboutPageLayout,
          app: 'auth',
          routes: [{ path: '/about', component: About }],
        },
        {
          path: '/auth',
          component: AuthPageLayout,
          app: 'auth',
          routes: [
            { path: '/auth/', exact: true, redirect: '/auth/signin' },
            { path: '/auth/signin', component: Signin },
            { path: '/auth/signup', component: Signup },
            { path: '/auth/forgot-password', component: ForgotPassword },
            { path: '/auth/passwords/reset/:key', component: ResetPassword },
          ],
        },
        {
          path: '/',
          component: AuthenticatedLayout,
          routes: [
            {
              path: '/',
              component: PageLayout,
              routes: [
                {
                  path: '/',
                  exact: true,
                  component: Timeline,
                  app: 'discussion',
                  tab: {
                    type: 'application',
                    icon: 'home',
                    renderLabel: () =>
                      i18n._('route.timeline.label', null, {
                        defaults: 'Timeline',
                      }),
                    tabMatch: tabMatchRoute,
                  },
                },
                {
                  path: '/discussions/:discussionId',
                  component: Discussion,
                  app: 'discussion',
                  tab: {
                    type: 'discussion',
                    renderLabel: ({ discussion }) => {
                      if (discussion) {
                        return discussion.participants
                          .map(renderParticipant)
                          .join(' ');
                      }

                      return i18n._('route.discussion.label', null, {
                        defaults: 'Discussion ...',
                      });
                    },
                    tabMatch: tabMatchPathname,
                  },
                },
                {
                  path: '/compose',
                  component: NewDraft,
                  app: 'discussion',
                  exact: true,
                  strict: true,
                  // tab: {
                  //   type: 'compose',
                  //   renderLabel: () => i18n._('compose.route.label'),
                  //   icon: 'pencil',
                  //   tabMatch: tabMatchRoute,
                  // },
                },
                {
                  path: '/messages/:messageId',
                  component: NewDraft,
                  app: 'discussion',
                  tab: {
                    type: 'compose',
                    icon: 'pencil',
                    renderLabel: () =>
                      i18n._('route.compose.label', null, {
                        defaults: 'Compose',
                      }),
                    tabMatch: tabMatchPathname,
                  },
                },
                {
                  path: '/contacts',
                  exact: true,
                  component: ContactBook,
                  app: 'contact',
                  tab: {
                    type: 'application',
                    icon: 'address-book',
                    renderLabel: () =>
                      i18n._('route.contact-book.label', null, {
                        defaults: 'Contacts',
                      }),
                    tabMatch: tabMatchRoute,
                  },
                },
                {
                  path: '/contact-association/:protocol/:address',
                  exact: true,
                  component: ContactAssociation,
                  app: 'contact',
                  tab: {
                    type: 'contact-association',
                    icon: 'address-book',
                    renderLabel: ({ label, address }) =>
                      i18n._(
                        'route.contact-association.label',
                        { label: label || address },
                        { defaults: 'Associate "{label}"' }
                      ),
                    tabMatch: tabMatchPathname,
                  },
                },
                {
                  // react-router 4.4 (not yet released - 03/03/19) will support array of strings
                  // path: ['/contacts/:contactId', '/contacts/:contactId/edit'],
                  path: '/contacts/:contactId',
                  exact: false,
                  strict: false,
                  // ---
                  component: Contact,
                  app: 'contact',
                  tab: {
                    type: 'contact',
                    icon: 'address-book',
                    renderLabel: ({ contact }) => {
                      const {
                        settings: { contact_display_format: format },
                      } = this.props;

                      return (
                        (contact && formatName({ contact, format })) ||
                        i18n._('contact.profile.name_not_set', null, {
                          defaults: '(N/A)',
                        })
                      );
                    },
                    tabMatch: tabMatchForContact,
                  },
                },
                {
                  path: '/new-contact',
                  component: Contact,
                  app: 'contact',
                  tab: {
                    type: 'default',
                    icon: 'address-book',
                    renderLabel: () =>
                      i18n._('route.new-contact.label', null, {
                        defaults: 'New contact',
                      }),
                    tabMatch: tabMatchRoute,
                  },
                },
                {
                  path: '/search-results',
                  component: SearchResults,
                  app: 'discussion',
                  tab: {
                    type: 'search',
                    icon: 'search',
                    renderLabel: ({ term }) =>
                      i18n._(
                        'route.search-results.label',
                        { term },
                        { defaults: 'Results for: {term}' }
                      ),
                    tabMatch: tabMatchRoute,
                  },
                },
                {
                  path: '/user',
                  app: 'user',
                  component: UserLayout,
                  tab: {
                    type: 'default',
                    icon: 'user',
                    renderLabel: () =>
                      i18n._('route.user.label.default', null, {
                        defaults: 'Account',
                      }),
                    tabMatch: tabMatchRoute,
                  },
                  routes: [
                    {
                      path: '/user/identities',
                      component: RemoteIdentitySettings,
                      tab: {
                        type: 'default',
                        icon: 'user',
                        renderLabel: () =>
                          i18n._('route.settings.label.identities', null, {
                            defaults: 'Security',
                          }),
                        tabMatch: tabMatchForSettings,
                      },
                    },
                    {
                      path: '/user/profile',
                      component: UserProfile,
                      tab: {
                        type: 'default',
                        icon: 'user',
                        renderLabel: () =>
                          i18n._('route.user.label.profile', null, {
                            defaults: 'Profile',
                          }),
                        tabMatch: tabMatchRoute,
                      },
                    },
                    // XXX: unused
                    // {
                    //   path: '/user/privacy',
                    //   component: UserPrivacy,
                    //   tab: {
                    //     type: 'default',
                    //     icon: 'user',
                    //     renderLabel: () => i18n._('route.user.label.privacy', null, { defaults:
                    //     'Privacy' }),
                    //     tabMatch: tabMatchRoute,
                    //   },
                    // },
                    {
                      path: '/user/security',
                      component: UserSecurity,
                      tab: {
                        type: 'default',
                        icon: 'user',
                        renderLabel: () =>
                          i18n._('route.user.label.security', null, {
                            defaults: 'Security',
                          }),
                        tabMatch: tabMatchRoute,
                      },
                    },
                  ],
                },
                {
                  path: '/settings',
                  app: 'settings',
                  component: SettingsLayout,
                  renderLabel: () =>
                    i18n._('route.settings.label.default', null, {
                      defaults: 'Settings',
                    }),
                  routes: [
                    {
                      path: '/settings/application',
                      component: ApplicationSettings,
                      tab: {
                        type: 'default',
                        icon: 'cog',
                        renderLabel: () =>
                          i18n._('route.settings.label.application', null, {
                            defaults: 'Devices',
                          }),
                        tabMatch: tabMatchForSettings,
                      },
                    },
                    {
                      path: '/settings/tags',
                      component: Tags,
                      tab: {
                        type: 'default',
                        icon: 'cog',
                        renderLabel: () =>
                          i18n._('route.settings.label.tags', null, {
                            defaults: 'Tags',
                          }),
                        tabMatch: tabMatchForSettings,
                      },
                    },

                    // TODO: enable devices when API ready: https://tree.taiga.io/project/caliopen-caliopen/us/314?no-milestone=1
                    {
                      path: '/settings/devices',
                      component: DevicesSettings,
                      tab: {
                        type: 'default',
                        icon: 'cog',
                        renderLabel: () =>
                          i18n._('route.settings.label.devices', null, {
                            defaults: 'Devices',
                          }),
                        tabMatch: tabMatchForSettings,
                      },
                    },
                    {
                      path: '/settings/new-device',
                      component: NewDeviceInfo,
                      tab: {
                        type: 'default',
                        icon: 'cog',
                        renderLabel: () =>
                          i18n._('route.settings.label.devices', null, {
                            defaults: 'Devices',
                          }),
                        tabMatch: tabMatchForSettings,
                      },
                    },

                    // TODO: enable signatures
                    // {
                    //  path: '/settings/signatures',
                    //  component: SettingsSignatures,
                    // tab: {
                    //   type: 'default',
                    //   icon: 'cog',
                    //   renderLabel: () => i18n._('route.settings.label.signatures', null,
                    // { defaults: 'Signatures' }),
                    //   tabMatch: tabMatchRoute,
                    // },
                    // },
                  ],
                },
                {
                  path: '/validate-device/:token',
                  component: SettingsLayout,
                  routes: [
                    {
                      path: '/validate-device/:token',
                      component: ValidateDevice,
                      tab: {
                        type: 'default',
                        icon: 'cog',
                        renderLabel: () =>
                          i18n._('route.settings.label.devices', null, {
                            defaults: 'Devices',
                          }),
                        tabMatch: tabMatchRoute,
                      },
                    },
                  ],
                },
                {
                  path: '/views/:viewId',
                  component: View,
                  tab: {
                    type: 'application',
                    icon: 'file',
                    renderLabel: () =>
                      i18n._('route.draft.label', null, { defaults: 'Drafts' }),
                    tabMatch: tabMatchPathname,
                  },
                },
                {
                  component: PageNotFound,
                },
              ],
            },
          ],
        },
        {
          component: PageNotFound,
        },
      ],
    });
  };

  render() {
    return <RoutingContext.Provider value={this.state} {...this.props} />;
  }
}

export default RoutingProvider;
