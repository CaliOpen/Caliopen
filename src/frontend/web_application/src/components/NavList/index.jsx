import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import NavItem from './components/NavItem';
import './style.scss';

const NavList = ({ className, dir, ...props }) => {
  const navClassName = classnames('m-nav-list', {
    'm-nav-list--vertical': dir === 'vertical',
  });

  return (
    <nav className={classnames('m-nav', className)}>
      <ul className={navClassName} {...props} />
    </nav>
  );
};

NavList.propTypes = {
  className: PropTypes.string,
  dir: PropTypes.oneOf(['vertical']),
};

NavList.defaultProps = {
  className: null,
  dir: null,
};

export { NavItem };

export default NavList;
