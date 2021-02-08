import {
  createNotification,
  NOTIFICATION_TYPE_SUCCESS,
  NOTIFICATION_TYPE_INFO,
  NOTIFICATION_TYPE_WARNING,
  NOTIFICATION_TYPE_ERROR,
} from 'react-redux-notify';
import { settingsSelector } from '../../settings';

const notify = ({
  message,
  duration,
  type = NOTIFICATION_TYPE_INFO,
  canDismiss = true,
  ...opts
}) => (dispatch, getState) => {
  const {
    settings: {
      notification_enabled: notificationEnabled,
      notification_delay_disappear: notificationDelayDisappear,
    },
  } = settingsSelector(getState());

  const customStyles = {
    // customStyles applied to Notification component
    'has-close': 'l-notification-center__notification--has-close',
    'has-close-all': 'l-notification-center__notification--has-close-all',
    item__message: 'l-notification-center__notification-item-message',
  };

  if (notificationEnabled) {
    return dispatch(
      createNotification({
        ...opts,
        message,
        type,
        duration: duration >= 0 ? duration : notificationDelayDisappear * 1000,
        canDismiss,
        customStyles,
      })
    );
  }

  return undefined;
};

export const notifySuccess = (opts) => (dispatch) =>
  dispatch(notify({ type: NOTIFICATION_TYPE_SUCCESS, ...opts }));
export const notifyInfo = (opts) => (dispatch) =>
  dispatch(notify({ type: NOTIFICATION_TYPE_INFO, ...opts }));
export const notifyWarning = (opts) => (dispatch) =>
  dispatch(notify({ type: NOTIFICATION_TYPE_WARNING, ...opts }));
export const notifyError = (opts) => (dispatch) =>
  dispatch(notify({ type: NOTIFICATION_TYPE_ERROR, ...opts }));
