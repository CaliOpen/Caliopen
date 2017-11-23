import React from 'react';
import PropTypes from 'prop-types';
import { RouteWithSubRoutes } from '../../routes';
import ScrollToWhenHash from '../../components/ScrollToWhenHash';
import User from '../../layouts/User';


const UserRoute = ({ routes }) => (
  <ScrollToWhenHash forceTop>
    <User>
      {routes.map((route, i) => (
        <RouteWithSubRoutes key={i} {...route} />
      ))}
    </User>
  </ScrollToWhenHash>
);

UserRoute.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default UserRoute;
