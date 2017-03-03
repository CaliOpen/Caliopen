import React, { PropTypes } from 'react';
import NavList, { ItemContent } from '../../components/NavList';
import Link from '../../components/Link';

import './style.scss';

const Settings = ({ __, children }) => {
  const navLinks = [
    { title: __('settings.account'), to: '/settings/account', active: false },
    { title: __('settings.application'), href: '/settings/appplication', active: false },
    { title: __('settings.tags'), to: '/settings/tags', active: false },
    { title: __('settings.devices'), to: '/settings/devices', active: false },
    { title: __('settings.signatures'), href: '/settings/signatures', active: false },
  ];

  return (
    <div className="l-settings">
      <NavList className="l-settings__nav">
        {navLinks.map(link => (
          <ItemContent active={link.active} large key={link.title}>
            <Link noDecoration {...link}>{link.title}</Link>
          </ItemContent>
        ))}
      </NavList>
      <div className="l-settings__panel">{children}</div>
    </div>
  );
};

Settings.propTypes = {
  children: PropTypes.node,
  __: PropTypes.func.isRequired,
};

Settings.defaultProps = {
  children: null,
};

export default Settings;
