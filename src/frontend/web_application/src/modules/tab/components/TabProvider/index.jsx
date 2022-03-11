import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withI18n } from '@lingui/react';
import { withRouter } from 'react-router-dom';
import { Tab } from '../../model/Tab';
import { TabContext } from '../../contexts/TabContext';
import { RoutingConsumer, findTabbableRouteConfig } from '../../../routing';

const withRoutes = () => (C) => function(props) {
  return <RoutingConsumer render={({ routes }) => <C routes={routes} {...props} />} />
};

@withRouter
@withRoutes()
@withI18n()
class TabProvider extends Component {
  static propTypes = {
    children: PropTypes.node,
    location: PropTypes.shape({ pathname: PropTypes.string }),
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
      goBack: PropTypes.func.isRequired,
    }).isRequired,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    routes: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  };

  static defaultProps = {
    children: null,
    location: {},
  };

  state = {
    previousPathname: undefined,
    providerValue: {
      tabs: [],
      removeTab: () => {
        // noop
      },
      updateTab: () => {
        // noop
      },
      getCurrentTab: () => {
        // noop
      },
    },
  };

  UNSAFE_componentWillMount() {
    this.setState((prevState) => ({
      providerValue: {
        ...prevState.providerValue,
        removeTab: this.removeTab,
        updateTab: this.updateTab,
        getCurrentTab: this.getCurrentTab,
      },
    }));
    this.initializeApps();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.location !== this.props.location) {
      this.setState((prevState) => ({
        previousPathname: this.props.location && this.props.location.pathname,
        providerValue: {
          ...prevState.providerValue,
          tabs: this.updateOrAddTab({
            location: nextProps.location,
            tabs: prevState.providerValue.tabs,
          }),
        },
      }));
    }
  }

  getPreviousTab = () =>
    this.state.providerValue.tabs.find(
      (tab) => tab.location.pathname === this.state.previousPathname
    );

  getCurrentTab = () =>
    this.state.providerValue.tabs.find(
      (tab) => tab.location.pathname === this.props.location.pathname
    );

  initializeApps = () => {
    const tabs = [
      new Tab({
        location: this.normalizeLocation({ pathname: '/' }),
      }),
      new Tab({
        location: this.normalizeLocation({ pathname: '/contacts' }),
      }),
      new Tab({
        location: this.normalizeLocation({ pathname: '/views/draft' }),
      }),
    ];
    const { location } = this.props;

    this.setState((prevState) => ({
      providerValue: {
        ...prevState.providerValue,
        tabs: this.updateOrAddTab({ location, tabs }),
      },
    }));
  };

  removeTab = ({ tab }) => {
    this.setState(
      (prevState) => ({
        providerValue: {
          ...prevState.providerValue,
          tabs: prevState.providerValue.tabs.filter((i) => i !== tab),
        },
      }),
      () => {
        const {
          location: { pathname },
        } = this.props;
        if (pathname !== tab.location.pathname) {
          return;
        }
        const previousTab = this.getPreviousTab();
        if (previousTab) {
          this.props.history.goBack();

          return;
        }

        this.props.history.push('/');
      }
    );
  };

  updateTab = ({ tab, original }) => {
    this.setState((prevState) => {
      const i = prevState.providerValue.tabs.indexOf(original);
      const nextTabs = [...prevState.providerValue.tabs];

      nextTabs[i] = tab;

      return {
        providerValue: {
          ...prevState.providerValue,
          tabs: nextTabs,
        },
      };
    });
  };

  normalizeLocation = ({ pathname = '', search = '', hash = '' }) => ({
    pathname,
    search,
    hash,
  });

  updateOrAddTab = ({ location, tabs }) => {
    if (!location) {
      return tabs;
    }

    const { pathname } = location;

    const routeConfig = findTabbableRouteConfig({
      pathname,
      routes: this.props.routes,
    });

    // there might be a better way to select a tab whenever it can be by id or route pattern
    // e.g contacts/<contactId> -> each contact has a tab
    // settings/<cat> -> all sub routes uses only one tab
    const original = tabs.find((tab) => {
      const currentRouteConfig = findTabbableRouteConfig({
        pathname: tab.location.pathname,
        routes: this.props.routes,
      });

      return currentRouteConfig.tab.tabMatch({
        pathname,
        tab,
        routeConfig: currentRouteConfig,
      });
    });

    if (original) {
      const i = tabs.indexOf(original);
      const nextTabs = [...tabs];

      nextTabs[i] = new Tab({
        ...original,
        location: this.normalizeLocation(location),
      });

      return nextTabs;
    }

    if (routeConfig) {
      const nextTabs = [
        ...tabs,
        new Tab({
          location: this.normalizeLocation(location),
        }),
      ];

      return nextTabs;
    }

    return tabs;
  };

  render() {
    return (
      <TabContext.Provider value={this.state.providerValue} {...this.props} />
    );
  }
}

export default TabProvider;
