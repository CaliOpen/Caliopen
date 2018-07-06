/* eslint-disable */
import React, { Component } from 'react';
import Tab from '../Tab';
import HorizontalScroll from '../../../Page/components/Navigation/components/Navbar/components/HorizontalScroll';
import { NavbarItem, ItemButton } from '../../../Page/components/Navigation/components/Navbar';
import { Button, Icon } from '../../../../components/';

import './style.scss';

class Navigation extends Component {
  componentDidMount() {
    this.props.requestTabs();
  }
  getTabIdentifier = ({ pathname, search, hash }) => `${pathname}${search}${hash}`;

  render() {
    const { tabs } = this.props;
    const isLast = tab => tabs.indexOf(tab) === (tabs.length - 1);

    return (
      <div className="navigation">
        <HorizontalScroll subscribedState={tabs}>
          {tabs.map(tab => (
            <Tab key={this.getTabIdentifier(tab)} tab={tab} last={isLast(tab)} />
          ))}
          <NavbarItem className="compose-item">
            <Button shape="plain" className="compose-btn"><Icon type="pencil" /> <Icon type="plus" /></Button>
          </NavbarItem>
        </HorizontalScroll>
      </div>
    );
  }
}

export default Navigation;
