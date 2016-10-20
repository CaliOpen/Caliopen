import React, { PropTypes } from 'react';
import './style.scss';
import brandImgPath from './images/brand.png';

const HeaderContainer = props => (
  <div className="l-header">
    <div className="l-header__wrapper">
      <div className="l-header__brand">
        <span className="show-for-small-only">
          <button
            aria-label={'header.menu.toggle-navigation'}
            data-toggle="left_off_canvas"
            type="button"
            className="l-header__menu-icon menu-icon"
          />
        </span>
        {props.brand(
          <img alt="CaliOpen" src={brandImgPath} className="l-header__brand-icon" />
        )}
      </div>
      <div className="l-header__search-toggler show-for-small-only">
        {
          props.searchAsDropdownToggler({
            'aria-label': 'header.menu.toggle-search-form',
            className: 'l-header__m-link m-link m-link--button',
          }, <span className="fa fa-search" />)
        }
      </div>
      <div
        className={`l-header__search ${props.searchAsDropdown ? 'l-header__search--as-dropdown' : ''}`}
      >
        {props.search}
      </div>
      <div className="l-header__user">
        {props.user}
      </div>
    </div>
  </div>
);

HeaderContainer.propTypes = {
  brand: PropTypes.func.isRequired,
  searchAsDropdownToggler: PropTypes.func.isRequired,
  searchAsDropdown: PropTypes.bool,
  search: PropTypes.element.isRequired,
  user: PropTypes.element.isRequired,
};

export default HeaderContainer;
