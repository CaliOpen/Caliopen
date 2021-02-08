import { i18nMark } from '@lingui/react';
import { requestMessages } from '../../store/modules/message';
import { requestContacts } from '../../store/modules/contact';

const APPLICATIONS = {
  discussions: {
    route: '/',
    icon: 'comments',
    label: i18nMark('header.menu.discussions'),
    refreshAction: (dispatch) => dispatch(requestMessages('timeline', '0')),
  },
  contacts: {
    route: '/contacts',
    icon: 'users',
    label: i18nMark('header.menu.contacts'),
    refreshAction: (dispatch) => dispatch(requestContacts()),
  },
};

export const getLabels = (i18n) => ({
  discussions: i18n._('header.menu.discussions', null, {
    defaults: 'Discussions',
  }),
  contacts: i18n._('header.menu.contacts', null, { defaults: 'Contacts' }),
});

export const getInfosFromName = (name) => ({
  name,
  ...APPLICATIONS[name],
});

export const getInfosFromRoute = (route) => {
  const applicationName = Object.keys(APPLICATIONS).find(
    (name) => APPLICATIONS[name].route === route
  );

  if (!applicationName) {
    return undefined;
  }

  return getInfosFromName(applicationName);
};

export const getApplications = () =>
  Object.keys(APPLICATIONS).map(getInfosFromName);
