import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { matchPath, withRouter } from 'react-router-dom';
import { withI18n } from '@lingui/react';
import MenuBar from '../../components/MenuBar';
import './style.scss';

@withI18n()
@withRouter
class Settings extends PureComponent {
  static propTypes = {
    location: PropTypes.shape({
      pathname: PropTypes.string,
    }).isRequired,
    children: PropTypes.node,
    i18n: PropTypes.shape({
      _: PropTypes.func,
    }).isRequired,
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
        key: 'settings.application',
        label: i18n._('settings.application', null, {
          defaults: 'Application',
        }),
        to: '/settings/application',
      },
      {
        key: 'settings.tags',
        label: i18n._('settings.tags', null, { defaults: 'Tags' }),
        to: '/settings/tags',
      },
      {
        key: 'settings.devices',
        label: i18n._('settings.devices', null, { defaults: 'Devices' }),
        to: '/settings/devices',
      },
      // { key: 'settings.signatures', label: i18n._('settings.signatures', null,
      // { defaults: 'Signatures' }),
      // to: '/settings/signatures' },
    ].map((link) => ({
      ...link,
      isActive:
        matchPath(pathname, { path: link.to, exact: false, strict: false }) &&
        true,
    }));

    return (
      <div className="l-settings">
        <MenuBar navLinks={navLinks} />
        <div>{children}</div>
      </div>
    );
  }
}

export default Settings;
