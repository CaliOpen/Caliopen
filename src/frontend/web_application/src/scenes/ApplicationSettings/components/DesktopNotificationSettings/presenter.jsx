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
      message: i18n._(
        /* i18n */ 'settings.desktop_notification.feedback.enabled',
        null,
        {
          message: 'Desktop notifications are enabled',
        }
      ),
      force: true,
    });
  };

  // eslint-disable-next-line
  renderNoSupport() {
    return (
      <div>
        <Trans
          id="settings.desktop_notification.no_support"
          message="Notifications are not supported by your browser"
        />
      </div>
    );
  }

  renderNotification() {
    if (this.state.hasBrowserNotificationPermission === PERMISSION_GRANTED) {
      return (
        <div>
          <span className="m-desktop-notifications--allowed">
            <Icon type="check" />{' '}
            <Trans
              id="settings.desktop_notification.desktop_notifications_enabled"
              message="Desktop notifications enabled"
            />{' '}
          </span>{' '}
          <Button onClick={this.handleClickTestBrowser} display="inline">
            <Trans
              id="settings.desktop_notification.action.test_desktop_notification"
              message="Check desktop notifications"
            />
          </Button>
        </div>
      );
    }

    if (this.state.hasBrowserNotificationPermission === PERMISSION_DENIED) {
      return (
        <div className="m-desktop-notifications--denied">
          <Icon type="remove" />{' '}
          <Trans
            id="settings.desktop_notification.disabled"
            message="Notifications are disabled, please check your browser settings"
          />
        </div>
      );
    }

    return (
      <div>
        <Button onClick={this.handleRequestBrowserNotification}>
          <Trans
            id="settings.desktop_notification.action.request-desktop_notification_permission"
            message="Enable desktop notifications"
          />
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
