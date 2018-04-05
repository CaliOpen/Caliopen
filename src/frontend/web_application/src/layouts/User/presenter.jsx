import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { matchPath } from 'react-router-dom';
import MenuBar from '../../components/MenuBar';

class User extends PureComponent {
  static propTypes = {
    pathname: PropTypes.string,
    children: PropTypes.node,
    i18n: PropTypes.shape({}).isRequired,
  };
  static defaultProps = {
    pathname: undefined,
    children: null,
  };

  render() {
    const { i18n, children, pathname } = this.props;

    const navLinks = [
      { key: 'user.profile', label: i18n._('user.profile', { defaults: 'Profile' }), to: '/user/profile' },
      // { key: 'user.privacy', label: i18n._('user.privacy', { defaults: 'Privacy' }), to:
      // '/user/privacy' },
      { key: 'user.security', label: i18n._('user.security', { defaults: 'Security' }), to: '/user/security' },
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
