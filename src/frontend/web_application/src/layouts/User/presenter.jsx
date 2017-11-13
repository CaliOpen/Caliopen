import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { matchPath } from 'react-router-dom';
import MenuBar from '../../components/MenuBar';

class User extends PureComponent {
  static propTypes = {
    pathname: PropTypes.string,
    children: PropTypes.node,
    __: PropTypes.func.isRequired,
  };
  static defaultProps = {
    pathname: undefined,
    children: null,
  };

  render() {
    const { __, children, pathname } = this.props;

    const navLinks = [
      // { title: __('user.profile'), to: '/user/profile' },
      // { title: __('user.privacy'), to: '/user/privacy' },
      { title: __('user.security'), to: '/user/security' },
    ].map(link => ({
      ...link,
      isActive: matchPath(pathname, { path: link.to, exact: false, strict: false }) && true,
    }));

    return (
      <div className="l-user">
        <MenuBar className="l-user__menu-bar" navLinks={navLinks} />
        <div className="l-user__panel">{children}</div>
      </div>
    );
  }
}

export default User;
