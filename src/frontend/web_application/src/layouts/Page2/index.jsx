/* eslint-disable */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Brand, Link, Icon, InputText } from '../../components/';
import { BackgroundImage } from '../../modules/pi';
import { PageActions } from '../../modules/control';
import StickyNavBar from '../Page/components/Navigation/components/StickyNavBar';
import Navigation from './components/Navigation';
import UserMenu from '../Page/components/Header/components/UserMenu';
import SearchField from '../Page/components/Header/components/SearchField';
import PageContainer from '../PageContainer';
import PageHeader from '../PageHeader';
import './style.scss';
import './navbar.scss';
import './footer.scss';

// const Tips = () => null;

class Page extends Component {
  render() {
    const { children } = this.props;

    return (
      <BackgroundImage context="secure" className="l-page">
        <PageHeader />

        <PageContainer>
          <PageActions className="l-page__main-actions"/>
        </PageContainer>

        <div className="l-navbar">
          <StickyNavBar
            className="l-navbar__wrapper"
            stickyClassName="l-navbar__wrapper--sticky"
          >
            <PageContainer>
              <Navigation />
            </PageContainer>
          </StickyNavBar>
        </div>

        <PageContainer>
          {children}
        </PageContainer>

        <PageContainer>
          <div className="l-footer">
            {/* <Tips /> */}
            <div className="l-footer__tips">
              <b>Astuce : </b>
              pour améliorer la confidentialitéde vos échanges, saviez-vous que vous pouviez lorem
              ipsum dolor sit amet!
            </div>

            {/* <Footer /> */}
            <div className="l-footer__logo"><Brand className="l-footer__brand" theme="low" /></div>
            <div className="l-footer__release">v0.0.0 Be good.</div>
          </div>
        </PageContainer>
      </BackgroundImage>
    );
  }
}

export default Page;
