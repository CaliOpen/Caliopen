/* eslint-disable */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Brand, Link, Icon, InputText } from '../../components/';
import BackgroundImage from '../Page/components/BackgroundImage';
import StickyNavBar from '../Page/components/Navigation/components/StickyNavBar';
import Navigation from './components/Navigation';
import UserMenu from '../Page/components/Header/components/UserMenu';
import SearchField from '../Page/components/Header/components/SearchField';
import './style.scss';

class Page extends Component {
  render() {
    const { children } = this.props;

    return (
      <BackgroundImage context="secure">
        <div className="page">
          <div className="header-device">
            <div className="center">
              Vous consultez actuellement vos messages dans un environement que vous avez classé comme <Link href="#">sûr</Link>, depuis un <Link href="#">appareil de confiance.</Link>
            </div>
          </div>
          <div className="header">
            <div className="center header-content">
              <Link to="/"><Brand className="brand" /></Link>
              <div className="notif-menu"><Button href="#"><Icon type="bell"/></Button></div>
              <div className="user-menu">
                <UserMenu />
              </div>
            </div>
          </div>
          <div className="center">
            <div className="main-actions">
              <Button shape="plain" className="write-btn"><Icon type="pencil" /> Écrire</Button>
              <div className="search-field">
                <InputText className="search-input" />
                <Button className="search-button" shape="plain">
                  Lancer la recherche <Icon type="search" />
                </Button>
              </div>
            </div>
          </div>
            <div className="navbar">
              <StickyNavBar
                className="navbar__wrapper"
                stickyClassName="navbar__wrapper--sticky"
              >
                <div className="center">
                  <Navigation />
                </div>
              </StickyNavBar>
          </div>
          <div className="center">
            {children}
          </div>
          <div className="center footer">
            <div className="astuce">
              <b>Astuce : </b>pour améliorer la confidentialitéde vos échanges, saviez-vous que vous pouviez lorem ipsum dolor sit amet!
            </div>
            <div className="logo"><Brand className="brand" /></div>
            <div className="release">v0.0.0 Be good.</div>
          </div>
        </div>
      </BackgroundImage>
    );
  }
}

export default Page;
