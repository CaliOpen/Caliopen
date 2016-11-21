import React, { PropTypes } from 'react';
import './style.scss';
import MainView from './components/MainView';
import OffCanvas from './components/OffCanvas';
import Header from './components/Header';
import Navigation from './components/Navigation';
import NavigationAlt from './components/NavigationAlt';
import NotificationCenter from './components/NotificationCenter';
import CallToAction from './components/CallToAction';

const PageContainer = props => (
  <OffCanvas leftChildren={<NavigationAlt />}>
    <MainView
      header={<Header />}
      nav={<Navigation />}
      callToAction={<CallToAction />}
      notification={<NotificationCenter />}
    >{ props.children }</MainView>
  </OffCanvas>
);

PageContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PageContainer;
