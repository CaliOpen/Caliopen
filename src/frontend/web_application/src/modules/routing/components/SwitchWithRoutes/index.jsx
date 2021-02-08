import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, Redirect } from 'react-router-dom';

class SwitchWithRoutes extends Component {
  static propTypes = {
    routes: PropTypes.arrayOf(PropTypes.shape({})),
  };

  static defaultProps = {
    routes: [],
  };

  getChildrenConfig = ({ routes, component: C, path }) => {
    switch (true) {
      case C && routes && routes.length > 0:
        return {
          render: () => (
            <C>
              <SwitchWithRoutes routes={routes} />
            </C>
          ),
        };
      case routes && routes.length > 0:
        return { render: () => <SwitchWithRoutes routes={routes} /> };
      case C && true:
        return { component: C };
      default:
        throw new Error(
          `no routes nor component property specified for the route: ${path}`
        );
    }
  };

  renderRoute = (i, routeConfig) => {
    const { path, exact, strict, redirect } = routeConfig;

    const config = {
      path,
      exact,
      strict,
    };

    if (redirect) {
      return (
        <Route key={i} {...config}>
          <Redirect to={redirect} />
        </Route>
      );
    }

    return (
      <Route key={i} {...config} {...this.getChildrenConfig(routeConfig)} />
    );
  };

  render() {
    const { routes } = this.props;

    return (
      <Switch>
        {routes.map((routeConfig, i) => this.renderRoute(i, routeConfig))}
      </Switch>
    );
  }
}

export default SwitchWithRoutes;
