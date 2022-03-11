import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Dropdown, { withDropdownControl } from '../Dropdown';
import './style.scss';

export { withDropdownControl };

// @deprecated: use Dropdown
function DropdownMenu({ className, hasTriangle, ...props }) {
  return <Dropdown
    className={classnames(
      'm-dropdown-menu',
      { 'm-dropdown-menu--has-triangle': hasTriangle },
      className
    )}
    {...props}
  />
}
DropdownMenu.propTypes = {
  className: PropTypes.string,
  hasTriangle: PropTypes.bool,
};

DropdownMenu.defaultProps = {
  className: null,
  hasTriangle: false,
};

export default DropdownMenu;
