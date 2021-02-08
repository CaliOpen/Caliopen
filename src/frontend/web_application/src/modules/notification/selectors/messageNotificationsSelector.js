import { createSelector } from 'reselect';

const MESSAGE_NOTIFICATION_TYPE = 'new_message';

export const messageNotificationsSelector = createSelector(
  [(state) => state.notification],
  (notificationState) =>
    notificationState.notifications.filter(
      (notif) => notif.type === MESSAGE_NOTIFICATION_TYPE
    )
);
