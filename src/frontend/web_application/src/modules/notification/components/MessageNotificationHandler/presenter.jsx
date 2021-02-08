import { Component } from 'react';
import PropTypes from 'prop-types';
import { withI18n } from '@lingui/react';
import isEqual from 'lodash.isequal';
import { withSettings } from '../../../settings';
import { notify as browserNotify } from '../../../../services/browser-notification';

const getNbNewMessages = (notifications) =>
  notifications.reduce((acc, notif) => acc + notif.body.size, 0);

@withI18n()
@withSettings()
class MessageNotificationHandler extends Component {
  static propTypes = {
    invalidateDiscussions: PropTypes.func.isRequired,
    invalidateCollections: PropTypes.func.isRequired,
    initialized: PropTypes.bool,
    notifications: PropTypes.arrayOf(PropTypes.shape({})),
    settings: PropTypes.shape({}),
    i18n: PropTypes.shape({ _: PropTypes.func.isRequired }).isRequired,
  };

  static defaultProps = {
    initialized: false,
    notifications: [],
    settings: undefined,
  };

  componentDidMount() {
    this.handleNotifications(this.props);
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.notifications, this.props.notifications)) {
      this.handleNotifications(this.props);
    }
  }

  handleNotifications = async ({ notifications, settings }) => {
    if (!settings) {
      return;
    }

    if (notifications.length === 0) {
      return;
    }

    const {
      invalidateDiscussions,
      invalidateCollections,
      initialized,
    } = this.props;

    if (initialized) {
      invalidateDiscussions();
      invalidateCollections();
    }

    if (settings.notification_enabled) {
      const { i18n } = this.props;
      const nbNewMessages = getNbNewMessages(notifications);

      // this notify only when document is not visible
      browserNotify({
        message: i18n._('desktop.notification.new_messages', [nbNewMessages], {
          defaults: 'You received {0} new messages',
        }),
      });
    }
  };

  render() {
    return null;
  }
}

export default MessageNotificationHandler;
