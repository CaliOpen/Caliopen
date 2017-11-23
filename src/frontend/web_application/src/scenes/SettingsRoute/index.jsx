import React from 'react';
import PropTypes from 'prop-types';
import { RouteWithSubRoutes } from '../../routes';
import ScrollToWhenHash from '../../components/ScrollToWhenHash';
import Settings from '../../layouts/Settings';


const SettingsRoute = ({ routes }) => (
  <ScrollToWhenHash forceTop>
    <Settings>
      {routes.map((route, i) => (
        <RouteWithSubRoutes key={i} {...route} />
      ))}
    </Settings>
  </ScrollToWhenHash>
);

SettingsRoute.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default SettingsRoute;
