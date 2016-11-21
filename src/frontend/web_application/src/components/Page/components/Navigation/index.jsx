import React from 'react';
import ApplicationSwitcher from './components/ApplicationSwitcher';
import Navbar, { Tab } from './components/Navbar';
import './style.scss';

const Navigation = () => (
  <Navbar className="l-navigation hide-for-small-only">
    <div className="l-navigation__wrapper" sticky-navbar-class="l-navigation__wrapper--sticky">
      <Tab className="l-navigation__application-switcher" active>
        <ApplicationSwitcher />
      </Tab>
      <div className="l-navigation__tab-list">
        <tab-list />
      </div>
      <div className="l-navigation__sliders-toggle">
        <Tab last><sliders-container /></Tab>
      </div>
    </div>
  </Navbar>
);

export default Navigation;
