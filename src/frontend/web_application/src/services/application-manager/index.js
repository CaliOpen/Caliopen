const APPLICATIONS = {
  discussions: {
    route: 'discussions',
    icon: 'comments',
    label: 'header.menu.discussions',
  },
  contacts: {
    route: 'contacts',
    icon: 'users',
    label: 'header.menu.contacts',
  },
};

export const getLabels = __ => ({
  discussions: __('header.menu.discussions'),
  contacts: __('header.menu.contacts'),
});

export const getInfosFromName = name => ({
  name,
  route: APPLICATIONS[name].route,
  icon: APPLICATIONS[name].icon,
});

export const getInfosFromRoute = (route) => {
  const applicationName = Object.keys(APPLICATIONS)
    .find(name => APPLICATIONS[name].route === route);

  if (!applicationName) {
    return undefined;
  }

  return getInfosFromName(applicationName);
};

export const getApplications = () => Object.keys(APPLICATIONS).map(getInfosFromName);
