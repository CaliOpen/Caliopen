/* eslint-disable */
import React, { Component } from 'react';
import Tab from '../Tab';
import HorizontalScroll from '../../../Page/components/Navigation/components/Navbar/components/HorizontalScroll';
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
        </HorizontalScroll>
      </div>
    );
  }
}

export default Navigation;
