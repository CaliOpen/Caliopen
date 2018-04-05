import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { matchPath } from 'react-router-dom';
import MenuBar from '../../components/MenuBar';
import './style.scss';

class Settings extends PureComponent {
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
      // { key: 'settings.identities', label: i18n._('settings.identities',
      // { defaults: 'Identities' }),
      // to: '/settings/identities' },
      { key: 'settings.application', label: i18n._('settings.application', { defaults: 'Application' }), to: '/settings/application' },
      { key: 'settings.tags', label: i18n._('settings.tags', { defaults: 'Tags' }), to: '/settings/tags' },
      { key: 'settings.devices', label: i18n._('settings.devices', { defaults: 'Devices' }), to: '/settings/devices' },
      // { key: 'settings.signatures', label: i18n._('settings.signatures',
      // { defaults: 'Signatures' }),
      // to: '/settings/signatures' },
    ].map(link => ({
      ...link,
      isActive: matchPath(pathname, { path: link.to, exact: false, strict: false }) && true,
    }));

    return (
      <div className="l-settings">
        <MenuBar className="l-settings__menu-bar" navLinks={navLinks} />
        <div className="l-settings__panel">{children}</div>
      </div>
    );
  }
}

export default Settings;
