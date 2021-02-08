export const flattenRouteConfig = (routes) =>
  routes.reduce((acc, route) => {
    const { routes: subRoutes, ...routeConfig } = route;
    let flattened = [...acc, routeConfig];
    if (subRoutes) {
      flattened = [...flattened, ...flattenRouteConfig(subRoutes)];
    }

    return flattened;
  }, []);
