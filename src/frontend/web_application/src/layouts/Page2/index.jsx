/* eslint-disable */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Brand, Link, Icon, InputText } from '../../components/';
import BackgroundImage from '../Page/components/BackgroundImage';
// import Navigation from '../Page/components/Navigation';
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
              <Brand className="brand" />
              <div className="notif-menu"><Button href="#"><Icon type="bell"/></Button></div>
              <div className="user-menu">
                <UserMenu />
              </div>
            </div>
          </div>
          <div className="main-actions center">
            <Button shape="plain" className="write-btn"><Icon type="pencil" /> Écrire</Button>
            <div className="search-field">
              <InputText className="search-input" />
              <Button className="search-button" shape="plain">
                Lancer la recherche <Icon type="search" />
              </Button>
            </div>
          </div>
          {/* <Navigation /> */}
          <div className="center">
            {children}
          </div>
        </div>
      </BackgroundImage>
    );
  }
}

export default Page;
