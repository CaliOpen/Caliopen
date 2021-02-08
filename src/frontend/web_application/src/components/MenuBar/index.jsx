import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import NavList, { NavItem } from '../NavList';
import Link from '../Link';
import './style.scss';

class MenuBar extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    navLinks: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string.isRequired,
        label: PropTypes.node.isRequired,
        title: PropTypes.string,
        isActive: PropTypes.bool,
        to: PropTypes.string.isRequired,
      })
    ),
  };

  static defaultProps = {
    className: null,
    children: null,
    navLinks: null,
  };

  render() {
    const { className, navLinks, children } = this.props;
    const menuBarClassName = classnames('m-menu-bar', className);

    return (
      <div className={menuBarClassName}>
        {navLinks && (
          <NavList className="m-menu-bar__navlist">
            {navLinks.map((link) => (
              <NavItem active={link.isActive} large key={link.key}>
                <Link
                  display="button"
                  noDecoration
                  title={link.title}
                  to={link.to}
                >
                  {link.label}
                </Link>
              </NavItem>
            ))}
          </NavList>
        )}
        {!navLinks && children}
      </div>
    );
  }
}

export default MenuBar;
