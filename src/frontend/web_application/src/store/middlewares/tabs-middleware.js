import { matchPath } from 'react-router-dom';
import { push } from 'react-router-redux';
import { URLSearchParams } from '../../services/url';
import { formatName } from '../../services/contact';
import { getInfosFromName } from '../../services/application-manager';
import { getTranslator } from '../../services/i18n';
import { SELECT_OR_ADD_TAB, REMOVE_TAB, addTab, selectOrAdd, updateTab } from '../modules/tab';
import { requestContact } from '../modules/contact';
import { requestMessages, getMessagesFromCollection } from '../modules/message';
import { getRouteConfig, flattenRouteConfig } from '../../routes';
import { getLastMessage, renderParticipant } from '../../services/message';

const registeredRoutes = [
  '/',
  '/contacts',
  '/discussions/:discussionId',
  '/contacts/:contactId',
  '/compose',
  '/new-contact',
  '/settings/:setting',
  '/user/:setting',
  '/search-results',
];

const routeActionHandler = ({ store, action }) => {
  if (action.type !== '@@router/LOCATION_CHANGE') {
    return;
  }
  const { pathname, search, hash } = action.payload;

  if (registeredRoutes.find(route => matchPath(pathname, { path: route }))) {
    store.dispatch(selectOrAdd({ pathname, search, hash }));
  }
};

const selectTabByPathname = ({ store, pathname }) =>
  store.getState().tab.tabs.find(tab => pathname === tab.pathname);

const createHomeTab = async (store, { pathname, search, hash }) => ({
  pathname,
  search,
  hash,
  label: 'Caliopen',
  icon: 'home',
});

const createDiscussionTab = async (store, discussionId, { pathname, search, hash }) => {
  await store.dispatch(requestMessages('discussion', discussionId, { discussion_id: discussionId }));
  const state = store.getState().message;
  const messages = getMessagesFromCollection('discussion', discussionId, { state });
  const message = getLastMessage(messages, true);

  if (message) {
    const label = message.participants.map(renderParticipant).join(' ');

    return {
      pathname,
      search,
      hash,
      label,
      icon: 'comments-o',
    };
  }

  return Promise.reject('no messages');
};

const createContactsTab = async (store, { pathname, search, hash }) => ({
  pathname,
  search,
  hash,
  label: 'Caliopen',
  icon: 'users',
});

const createContactTab = async (store, contactId, { pathname, search, hash }) =>
  store.dispatch(requestContact(contactId))
    .then(({ payload: { data: contact } }) => {
      const { translate: __ } = getTranslator();
      const { settings } = store.getState().settings;
      const format = settings.contact_display_format;
      const label = formatName({ contact, format }) || __('contact.profile.name_not_set');

      return {
        pathname,
        search,
        hash,
        label,
        icon: 'user',
      };
    });

const createNewContactTab = ({ pathname, search, hash }) => {
  const { translate: __ } = getTranslator();

  return {
    pathname,
    search,
    hash,
    label: __('new-contact.route.label'),
    icon: 'user',
  };
};

const createComposeTab = ({ pathname, search, hash }) => {
  const { translate: __ } = getTranslator();

  return {
    pathname,
    search,
    hash,
    label: __('compose.route.label'),
    icon: 'pencil',
  };
};

const createSearchResultTab = ({ pathname, search, hash }) => {
  const { translate: __ } = getTranslator();
  const term = new URLSearchParams(search).get('term');

  return {
    pathname,
    search,
    hash,
    label: __('search-results.route.label', { term }),
    icon: 'search',
  };
};

const selectOrAddHomeTab = (store, { pathname, search, hash }) => {
  const match = matchPath(pathname, { path: '/' });
  if (!(match && match.isExact)) {
    return null;
  }

  const original = selectTabByPathname({ store, pathname });
  if (original) {
    return store.dispatch(updateTab({
      original,
      tab: {
        ...original, pathname, search, hash,
      },
    }));
  }

  return createHomeTab(store, { pathname, search, hash })
    .then(tab => store.dispatch(addTab(tab)));
};

const selectOrAddTabContacts = (store, { pathname, search, hash }) => {
  const match = matchPath(pathname, { path: '/contacts' });
  if (!(match && match.isExact)) {
    return null;
  }

  const original = selectTabByPathname({ store, pathname });
  if (original) {
    return store.dispatch(updateTab({
      original,
      tab: {
        ...original, pathname, search, hash,
      },
    }));
  }

  return createContactsTab(store, { pathname, search, hash })
    .then(tab => store.dispatch(addTab(tab)));
};

const selectOrAddTabDiscussion = async (store, { pathname, search, hash }) => {
  const match = matchPath(pathname, { path: '/discussions/:discussionId' });
  if (!match) {
    return null;
  }
  const original = selectTabByPathname({ store, pathname });
  if (original) {
    return store.dispatch(updateTab({
      original,
      tab: {
        ...original, pathname, search, hash,
      },
    }));
  }

  const { params: { discussionId } } = match;

  return createDiscussionTab(store, discussionId, { pathname, search, hash })
    .then(tab => store.dispatch(addTab(tab)));
};

const selectOrAddTabContact = async (store, { pathname, search, hash }) => {
  const match = matchPath(pathname, { path: '/contacts/:contactId' });
  if (!match) {
    return null;
  }
  const original = selectTabByPathname({ store, pathname });
  if (original) {
    return store.dispatch(updateTab({
      original,
      tab: {
        ...original, pathname, search, hash,
      },
    }));
  }

  const { params: { contactId } } = match;

  return createContactTab(store, contactId, { pathname, search, hash })
    .then(tab => store.dispatch(addTab(tab)));
};

const selectOrAddTabNewContact = (store, { pathname, search, hash }) => {
  const match = matchPath(pathname, { path: '/new-contact' });
  if (!match) {
    return null;
  }
  const original = selectTabByPathname({ store, pathname });
  if (original) {
    return store.dispatch(updateTab({
      original,
      tab: {
        ...original, pathname, search, hash,
      },
    }));
  }

  const tab = createNewContactTab({ pathname, search, hash });

  return store.dispatch(addTab(tab));
};

const getSettingTab = ({ pathname, search, hash }) => {
  const { translate: __ } = getTranslator();

  const routeConfig = flattenRouteConfig(getRouteConfig({ __ }))
    .filter(route => route.path && route.path.indexOf('/settings/') !== -1)
    .find(route => matchPath(pathname, { path: route.path }));

  return {
    pathname,
    search,
    hash,
    label: (routeConfig && routeConfig.label) || __('settings.route.label.default'),
    icon: 'cog',
  };
};

const selectOrAddTabSetting = (store, { pathname, search, hash }) => {
  if (!matchPath(pathname, { path: '/settings/:subpath' })) {
    return null;
  }

  const original = store.getState().tab.tabs
    .find(tab => matchPath(tab.pathname, { path: '/settings' }));

  const tab = getSettingTab({ pathname, search, hash });
  if (original) {
    return store.dispatch(updateTab({ original, tab }));
  }

  return store.dispatch(addTab(tab));
};

const getUserTab = ({ pathname, search, hash }) => {
  const { translate: __ } = getTranslator();

  const routeConfig = flattenRouteConfig(getRouteConfig({ __ }))
    .filter(route => route.path && route.path.indexOf('/user/') !== -1)
    .find(route => matchPath(pathname, { path: route.path }));

  return {
    pathname,
    search,
    hash,
    label: (routeConfig && routeConfig.label) || __('user.route.label.default'),
    icon: 'user',
  };
};

const selectOrAddTabUser = (store, { pathname, search, hash }) => {
  if (!matchPath(pathname, { path: '/user/:subpath' })) {
    return null;
  }

  const original = store.getState().tab.tabs
    .find(tab => matchPath(tab.pathname, { path: '/user' }));

  const tab = getUserTab({ pathname, search, hash });
  if (original) {
    return store.dispatch(updateTab({
      original, tab, search, hash,
    }));
  }

  return store.dispatch(addTab(tab));
};


const selectOrAddTabCompose = (store, { pathname, search, hash }) => {
  const match = matchPath(pathname, { path: '/compose' });
  if (!match) {
    return null;
  }
  const original = selectTabByPathname({ store, pathname });
  if (original) {
    return store.dispatch(updateTab({
      original,
      tab: {
        ...original, pathname, search, hash,
      },
    }));
  }

  const tab = createComposeTab({ pathname, search, hash });

  return store.dispatch(addTab(tab));
};

const selectOrAddTabSearch = (store, { pathname, search, hash }) => {
  const match = matchPath(pathname, { path: '/search-results' });
  if (!match) {
    return null;
  }

  const term = new URLSearchParams(search).get('term');

  const original = store.getState().tab.tabs
    .find(tab =>
      matchPath(tab.pathname, { path: '/search-results' }) &&
      RegExp(`term=${term}(&.*)?$`, 'i').test(tab.search));

  const tab = createSearchResultTab({ pathname, search, hash });
  if (original) {
    return store.dispatch(updateTab({ original, tab: { ...original, ...tab } }));
  }

  return store.dispatch(addTab(tab));
};

export default store => next => (action) => {
  routeActionHandler({ store, action });

  const result = next(action);

  if (action.type === SELECT_OR_ADD_TAB) {
    const { payload: { pathname, search, hash } } = action;
    [
      selectOrAddHomeTab, selectOrAddTabContacts, selectOrAddTabDiscussion, selectOrAddTabContact,
      selectOrAddTabNewContact, selectOrAddTabSetting, selectOrAddTabUser, selectOrAddTabCompose,
      selectOrAddTabSearch,
    ]
      .forEach(fn => fn(store, { pathname, search, hash }));
  }

  if (action.type === REMOVE_TAB) {
    const { pathname } = action.payload.tab;
    const state = store.getState();
    if (matchPath(state.router.location.pathname, { path: pathname, exact: true })) {
      const { applicationName } = store.getState().application;
      store.dispatch(push(getInfosFromName(applicationName).route));
    }
  }

  return result;
};
