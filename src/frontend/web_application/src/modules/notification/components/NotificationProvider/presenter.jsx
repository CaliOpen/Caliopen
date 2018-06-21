import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { getNextNotifications } from '../../services/getNextNotifications';
import MessageNotifier from '../MessageNotifier';
import { getConfig } from '../../../device/services/storage';

class NotificationProvider extends Component {
  static propTypes = {
    children: PropTypes.node,
    updateNotifications: PropTypes.func.isRequired,
    notifications: PropTypes.arrayOf(PropTypes.shape({})),
    user: PropTypes.shape({}),
  };
  static defaultProps = {
    children: null,
    notifications: [],
    user: undefined,
  };
  state = {
    isWorking: false,
    initialized: false,
  };

  componentDidMount() {
    import('../../services/notification.worker.js').then(({ default: Worker }) => {
      this.setState({
        initialized: true,
      }, () => {
        this.worker = new Worker();
        if (this.props.user) {
          this.startWorker();
        }
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.user !== this.props.user) {
      this.toggleWorker(!!nextProps.user);
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
  }

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
  }

  stopWorker = () => {
    if (!this.state.isWorking || !this.state.initialized) {
      return;
    }
    this.setState({ isWorking: false }, () => {
      this.worker.postMessage({ action: 'stop' });
    });
  }

  handleWorkerStatus = (message) => {
    const { status } = message;
    if (!status) {
      return;
    }

    switch (status) {
      case 'terminated':
        this.stopWorker();
        break;
      default:
        break;
    }
  }

  handleWorkerResults = (message) => {
    const { results } = message;
    if (!results) {
      return;
    }
    const { updateNotifications, notifications } = this.props;
    updateNotifications(getNextNotifications(results.notifications, notifications));
  }

  render() {
    const { children } = this.props;

    return (
      <Fragment>
        {children}
        <MessageNotifier />
      </Fragment>
    );
  }
}

export default NotificationProvider;
