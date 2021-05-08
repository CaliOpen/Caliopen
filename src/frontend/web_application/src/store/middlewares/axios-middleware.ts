import axiosMiddleware from 'redux-axios-middleware';
import {
  createNotification,
  NOTIFICATION_TYPE_ERROR,
} from 'react-redux-notify';
import getClient from '../../services/api-client';
import { signout } from '../../modules/routing';

export default axiosMiddleware(getClient(), {
  returnRejectedPromiseOnError: true,
  interceptors: {
    request: [
      ({ getState }, config) => {
        const [min, max] = getState().importanceLevel.range;

        return {
          ...config,
          headers: {
            ...config.headers,
            'X-Caliopen-IL': `${min};${max}`,
          },
        };
      },
    ],
    response: [
      {
        error: ({ getState, dispatch }, error) => {
          // customStyles applied to Notification component
          const customStyles = {
            'has-close': 'l-notification-center__notification--has-close',
            'has-close-all':
              'l-notification-center__notification--has-close-all',
            item__message: 'l-notification-center__notification-item-message',
          };
          if (error.response && error.response.status === 401) {
            signout({ withRedirect: true });
            throw error;
          }

          if (error.response && error.response.status >= 500) {
            const notification = {
              // FIXME: trad
              message:
                'Sorry, an unexpected error occured. developers will work hard on this error during alpha phase. Please feel free to describe us what happened.',
              type: NOTIFICATION_TYPE_ERROR,
              duration: 0,
              canDismiss: true,
              customStyles,
            };

            if (
              !getState().notifications.find(
                ({ message }) => message === notification.message
              )
            ) {
              dispatch(createNotification(notification));
            }
          }

          throw error;
        },
      },
    ],
  },
});
