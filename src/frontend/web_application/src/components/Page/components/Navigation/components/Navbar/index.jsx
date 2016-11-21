import React, { PropTypes } from 'react';
import classnames from 'classnames';
import Link from './components/Link';
import Tab from './components/Tab';
import './style.scss';

const Navbar = ({ className, ...props }) => {
  const navbarProps = {
    ...props,
    className: classnames('m-navbar', className),
  };

  return (
    <div {...navbarProps} />
  );
};

Navbar.propTypes = {
  className: PropTypes.string,
};

export default Navbar;
export { Link, Tab };
