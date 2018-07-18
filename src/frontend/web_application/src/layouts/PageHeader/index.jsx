import React, { PureComponent } from 'react';
// import PropTypes from 'prop-types';
import { Button, Brand, Link, Icon } from '../../components/';
import PageContainer from '../PageContainer';
import UserMenu from '../Page/components/Header/components/UserMenu';
import './style.scss';

class PageHeader extends PureComponent {
  render() {
    return (
      <div className="l-page-header">
        <PageContainer>
          <Link to="/"><Brand className="l-page-header__brand" /></Link>
          <div className="l-page-header__notif-menu"><Button href="#"><Icon type="bell" /></Button></div>
          <div className="l-page-header__user-menu">
            <UserMenu />
          </div>
        </PageContainer>
      </div>
    );
  }
}

export default PageHeader;
