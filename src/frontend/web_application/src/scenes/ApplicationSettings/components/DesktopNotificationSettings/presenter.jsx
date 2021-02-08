import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import { Icon, Button } from '../../../../components';
import {
  notify,
  requestPermission,
  isSupported,
  PERMISSION_DENIED,
  PERMISSION_GRANTED,
} from '../../../../services/browser-notification';
import './style.scss';

class DesktopNotificationSettings extends Component {
  static propTypes = {
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  UNSAFE_componentWillMount() {
    this.setState({
      hasBrowserNotificationPermission: isSupported && Notification.permission,
    });
  }

  handleRequestBrowserNotification = async () => {
    const permission = await requestPermission();
    this.setState({
      hasBrowserNotificationPermission: permission,
    });
  };

  handleClickTestBrowser = () => {
    const { i18n } = this.props;

    return notify({
      message: i18n._('settings.desktop_notification.feedback.enabled', null, {
        defaults: 'Desktop notifications are enabled',
      }),
      force: true,
    });
  };

  // eslint-disable-next-line
  renderNoSupport() {
    return (
      <div>
        <Trans id="settings.desktop_notification.no_support">
          Notifications are not supported by your browser
        </Trans>
      </div>
    );
  }

  renderNotification() {
    if (this.state.hasBrowserNotificationPermission === PERMISSION_GRANTED) {
      return (
        <div>
          <span className="m-desktop-notifications--allowed">
            <Icon type="check" />{' '}
            <Trans id="settings.desktop_notification.desktop_notifications_enabled">
              Desktop notifications enabled
            </Trans>{' '}
          </span>{' '}
          <Button onClick={this.handleClickTestBrowser} display="inline">
            <Trans id="settings.desktop_notification.action.test_desktop_notification">
              Check desktop notifications
            </Trans>
          </Button>
        </div>
      );
    }

    if (this.state.hasBrowserNotificationPermission === PERMISSION_DENIED) {
      return (
        <div className="m-desktop-notifications--denied">
          <Icon type="remove" />{' '}
          <Trans id="settings.desktop_notification.disabled">
            Notifications are disabled, please check your browser settings
          </Trans>
        </div>
      );
    }

    return (
      <div>
        <Button onClick={this.handleRequestBrowserNotification}>
          <Trans id="settings.desktop_notification.action.request-desktop_notification_permission">
            Enable desktop notifications
          </Trans>
        </Button>
      </div>
    );
  }

  render() {
    return (
      <div>
        {isSupported ? this.renderNotification() : this.renderNoSupport()}
      </div>
    );
  }
}

export default DesktopNotificationSettings;
