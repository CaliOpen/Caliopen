import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { matchPath, withRouter } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import MenuBar from '../../components/MenuBar';

import './styles.scss';

@withI18n()
@withRouter
class User extends PureComponent {
  static propTypes = {
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
    }).isRequired,
    children: PropTypes.node,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  static defaultProps = {
    children: null,
  };

  render() {
    const {
      i18n,
      children,
      location: { pathname },
    } = this.props;

    const navLinks = [
      {
        key: 'user.identities',
        label: i18n._('settings.identities', null, {
          defaults: 'External accounts',
        }),
        to: '/user/identities',
      },
      {
        key: 'user.profile',
        label: i18n._('user.profile', null, { defaults: 'Profile' }),
        to: '/user/profile',
      },
      // { key: 'user.privacy', label: i18n._('user.privacy', null, { defaults: 'Privacy' }), to:
      // '/user/privacy' },
      {
        key: 'user.security',
        label: i18n._('user.security', null, { defaults: 'Security' }),
        to: '/user/security',
      },
    ].map((link) => ({
      ...link,
      isActive:
        matchPath(pathname, { path: link.to, exact: false, strict: false }) &&
        true,
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
