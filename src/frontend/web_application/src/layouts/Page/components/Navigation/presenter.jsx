import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import HorizontalScroll from '../HorizontalScroll';
import {
  Tab,
  NavbarItem,
  ApplicationTab,
  DiscussionTab,
  ContactAssociationTab,
  ContactTab,
  SearchTab,
} from '../Navbar/components';
import { Button, Icon } from '../../../../components';
import { Tab as TabModel, withCurrentTab } from '../../../../modules/tab';
import { withPush, findTabbableRouteConfig } from '../../../../modules/routing';
import './style.scss';

@withPush()
@withCurrentTab()
class Navigation extends Component {
  static propTypes = {
    className: PropTypes.string,
    currentTab: PropTypes.shape({}),
    isSticky: PropTypes.bool,
    tabs: PropTypes.arrayOf(PropTypes.instanceOf(TabModel)).isRequired,
    routes: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    removeTab: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
  };

  static defaultProps = {
    className: undefined,
    currentTab: undefined,
    isSticky: false,
  };

  getTabIdentifier = ({ pathname, search, hash }) =>
    `${pathname}${search}${hash}`;

  handleClickCompose = () => {
    this.props.push('/compose');
  };

  renderTab({ tab }) {
    const { removeTab, routes, currentTab } = this.props;
    const routeConfig = findTabbableRouteConfig({
      pathname: tab.location.pathname,
      routes,
    });
    const isActive = currentTab === tab;

    switch (routeConfig.tab.type) {
      case 'application':
        return (
          <ApplicationTab
            key={this.getTabIdentifier(tab.location)}
            tab={tab}
            routeConfig={routeConfig}
            isActive={isActive}
          />
        );
      case 'contact-association':
        return (
          <ContactAssociationTab
            key={this.getTabIdentifier(tab.location)}
            tab={tab}
            routeConfig={routeConfig}
            isActive={isActive}
            onRemove={removeTab}
          />
        );
      case 'contact':
        return (
          <ContactTab
            key={this.getTabIdentifier(tab.location)}
            tab={tab}
            routeConfig={routeConfig}
            isActive={isActive}
            onRemove={removeTab}
          />
        );
      case 'discussion':
        return (
          <DiscussionTab
            key={this.getTabIdentifier(tab.location)}
            tab={tab}
            routeConfig={routeConfig}
            isActive={isActive}
            onRemove={removeTab}
          />
        );
      case 'search':
        return (
          <SearchTab
            key={this.getTabIdentifier(tab.location)}
            tab={tab}
            routeConfig={routeConfig}
            isActive={isActive}
            onRemove={removeTab}
          />
        );
      default:
        return (
          <Tab
            key={this.getTabIdentifier(tab.location)}
            tab={tab}
            routeConfig={routeConfig}
            isActive={isActive}
            onRemove={removeTab}
          />
        );
    }
  }

  render() {
    const { tabs, className, isSticky } = this.props;
    const subscribedState = { tabs, isSticky };

    return (
      <div className={classnames('l-navigation', className)}>
        <HorizontalScroll subscribedState={subscribedState}>
          {tabs.map((tab) => this.renderTab({ tab }))}
          <NavbarItem
            key="compose-button"
            className={classnames('l-navigation__compose-item', {
              'l-navigation__compose-item--sticky': isSticky,
            })}
          >
            <Button
              onClick={this.handleClickCompose}
              shape="plain"
              display="expanded"
              className="l-navigation__compose-btn"
            >
              <Icon type="pencil" /> <Icon type="plus" />
            </Button>
          </NavbarItem>
        </HorizontalScroll>
      </div>
    );
  }
}

export default Navigation;
