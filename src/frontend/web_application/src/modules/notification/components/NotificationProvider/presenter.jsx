import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withI18n } from '@lingui/react';
import isEqual from 'lodash/isEqual';
import { withUser } from 'src/modules/user';
import MessageNotificationHandler from '../MessageNotificationHandler';
import { getConfig } from '../../../device/services/storage';
import { signout } from '../../../routing';

@withI18n()
@withUser()
class NotificationProvider extends Component {
  static propTypes = {
    children: PropTypes.node,
    updateNotifications: PropTypes.func.isRequired,
    setInitialized: PropTypes.func.isRequired,
    notifications: PropTypes.arrayOf(PropTypes.shape({})),
    userState: PropTypes.shape({ user: PropTypes.shape({}) }).isRequired,
  };

  static defaultProps = {
    children: null,
    notifications: [],
  };

  state = {
    isWorking: false,
    initialized: false,
  };

  componentDidMount() {
    import('../../services/notification.worker.js').then(
      ({ default: Worker }) => {
        this.setState(
          {
            initialized: true,
          },
          () => {
            this.worker = new Worker();
            if (this.props.user) {
              this.startWorker();
            }
          }
        );
      }
    );
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.userState.user !== this.props.userState.user) {
      this.toggleWorker(!!this.props.userState.user);
    }

    if (prevState.isWorking === true && this.state.isWorking === false) {
      // try to restart after a while
      setTimeout(() => {
        this.startWorker();
      }, 1 * 60 * 1000);
    }
  }

  componentWillUnmount() {
    this.stopWorker();
  }

  toggleWorker = (hasUser = false) => {
    if (hasUser) {
      this.startWorker();

      return;
    }

    this.stopWorker();
  };

  startWorker = () => {
    if (this.state.isWorking || !this.state.initialized) {
      return;
    }
    this.setState({ isWorking: true }, () => {
      this.worker.postMessage({ action: 'start', device: getConfig() });
      this.worker.addEventListener('message', (ev) => {
        this.handleWorkerStatus(ev.data);
        this.handleWorkerResults(ev.data);
      });
    });
  };

  stopWorker = () => {
    if (!this.state.isWorking || !this.state.initialized) {
      return;
    }
    this.setState({ isWorking: false }, () => {
      this.worker.postMessage({ action: 'stop' });
    });
  };

  updateLastNotifId = (lastNotif) => {
    this.worker.postMessage({
      action: 'updateFilters',
      filters: { from: lastNotif.notif_id },
    });
  };

  handleWorkerStatus = (message) => {
    const { status } = message;
    if (!status) {
      return;
    }

    switch (status) {
      case 'terminated':
        this.stopWorker();
        break;
      case 'auth_lost':
        this.stopWorker();
        signout({ withRedirect: true });
        break;
      default:
        break;
    }
  };

  handleWorkerResults = (message) => {
    const { results } = message;
    if (!results) {
      return;
    }
    const { updateNotifications, notifications, setInitialized } = this.props;
    const prevNotifIds = notifications.map((notif) => notif.notif_id).sort();
    const notifIds = results.notifications
      .map((notif) => notif.notif_id)
      .sort();

    if (!isEqual(prevNotifIds, notifIds)) {
      const lastNotification = [...results.notifications].pop();
      if (lastNotification) {
        this.updateLastNotifId(lastNotification);
      }
      updateNotifications(results.notifications);
    }
    setInitialized();
  };

  render() {
    const { children } = this.props;

    return (
      <Fragment>
        {children}
        <MessageNotificationHandler />
      </Fragment>
    );
  }
}

export default NotificationProvider;
