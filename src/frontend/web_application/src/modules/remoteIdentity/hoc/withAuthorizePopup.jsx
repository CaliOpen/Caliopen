/* eslint-disable no-param-reassign */
import React from 'react';

const popups = {};
const MAX_TIMEOUT = 3600;

class Popup {
  constructor(props = {}) {
    Object.assign(this, props);
  }

  provider;

  window;

  detectionId;

  detectionInc = 0;

  static getPopupName({ providerName }) {
    return `authorization_${providerName}`;
  }
}

export const withAuthorizePopup = () => (C) => {
  // a popup must be initialized in a synchronous way or it will be blocked by the browser
  const initPopup = ({ providerName }) => {
    const popup = popups[providerName] || new Popup();

    if (!popup.window || popup.window.closed) {
      popup.window = window.open(
        '',
        Popup.getPopupName({ providerName }),
        'resizable,scrollbars,status'
      );
      popups[providerName] = popup;
    }
  };

  const stopDetection = ({ popup }) => {
    popup.window.close();
    clearInterval(popup.detectionId);
    popups[popup.provider.name] = undefined;
  };

  const detectPopupSuccess = ({ popup }) =>
    new Promise((resolve, reject) => {
      popup.detectionInc = 0;
      popup.detectionId = setInterval(() => {
        popup.detectionInc += 1;
        try {
          if (
            popup.window.location.href.includes(
              popup.provider.oauth_callback_uri
            )
          ) {
            stopDetection({ popup });
            resolve('success');

            return;
          }
        } catch (err) {
          // still on distant location
        }

        if (popup.window.closed) {
          stopDetection({ popup });
          reject(new Error('popup has been closed'));
        }

        if (popup.detectionInc >= MAX_TIMEOUT) {
          stopDetection({ popup });
          reject(new Error('popup timeout'));
        }
      }, 1000);
    });

  const authorizePopup = ({ provider }) => {
    const popup = popups[provider.name];
    if (!popup || popup.window.closed) {
      return Promise.reject(new Error('popup has been closed'));
    }

    popup.provider = provider;
    popup.window.location.href = provider.oauth_request_url;

    return detectPopupSuccess({ popup });
  };

  const authorizeProps = {
    initPopup,
    authorizePopup,
  };

  return (props) => <C {...authorizeProps} {...props} />;
};
