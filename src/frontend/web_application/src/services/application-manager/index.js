export const ApplicationRoutes = {
  discussions: 'discussions',
  contacts: 'contact-list',
};

const APPLICATION_ICONS = {
  discussions: 'comments',
  contacts: 'users',
};

export const getInfosFromName = name => ({
  name,
  route: ApplicationRoutes[name],
  icon: APPLICATION_ICONS[name],
});

export const getInfosFromRoute = (route) => {
  const applicationName = Object.keys(ApplicationRoutes)
    .find(name => ApplicationRoutes[name] === route);

  if (!applicationName) {
    return undefined;
  }

  return getInfosFromName(applicationName);
};

export const getApplications = () => Object.keys(ApplicationRoutes).map(getInfosFromName);
