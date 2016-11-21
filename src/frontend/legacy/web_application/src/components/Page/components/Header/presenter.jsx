import React, { PropTypes } from 'react';
import classnames from 'classnames';
import './style.scss';
import brandImgPath from './images/brand.png';

const Presenter = ({ brand, searchAsDropdownToggler, searchAsDropdown, search, user }) => {
  const searchClassName = classnames(
    'l-header__search',
    { 'l-header__search--as-dropdown': searchAsDropdown }
  );

  return (
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
          {brand(
            <img alt="CaliOpen" src={brandImgPath} className="l-header__brand-icon" />
          )}
        </div>
        <div className="l-header__search-toggler show-for-small-only">
          {searchAsDropdownToggler}
        </div>
        <div className={searchClassName}>
          <div className="l-header__m-search-field">{search}</div>
        </div>
        <div className="l-header__user">{user}</div>
      </div>
    </div>
  );
};

Presenter.propTypes = {
  brand: PropTypes.func.isRequired,
  searchAsDropdownToggler: PropTypes.node.isRequired,
  searchAsDropdown: PropTypes.bool,
  search: PropTypes.element.isRequired,
  user: PropTypes.element.isRequired,
};

export default Presenter;
