export const PERMISSION_GRANTED = 'granted';
export const PERMISSION_DENIED = 'denied';

export const isSupported =
  typeof window !== 'undefined' && 'Notification' in window;

export const requestPermission = () =>
  new Promise((resolve, reject) => {
    if (!isSupported) {
      reject(new Error('Browser notifications not supported'));

      return;
    }

    window.Notification.requestPermission((permission) => resolve(permission));
  });

export const isBrowserNotificationGrantedOrAsk = async () => {
  let { permission } = window.Notification;
  if (![PERMISSION_DENIED, PERMISSION_GRANTED].includes(permission)) {
    try {
      permission = await requestPermission();
    } catch (err) {
      return false;
    }
  }

  return permission === PERMISSION_GRANTED;
};

// cf. https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API#Use_cases
const isDocumentVisible = () => {
  let hidden;
  if (typeof document.hidden !== 'undefined') {
    // Opera 12.10 and Firefox 18 and later support
    hidden = 'hidden';
  } else if (typeof document.msHidden !== 'undefined') {
    hidden = 'msHidden';
  } else if (typeof document.webkitHidden !== 'undefined') {
    hidden = 'webkitHidden';
  }

  return !document[hidden];
};

export const notify = async ({ message, force = false }) => {
  if (!isSupported) {
    return Promise.reject(new Error('Browser notifications not supported'));
  }

  if (isDocumentVisible() && !force) {
    return undefined;
  }

  if (await isBrowserNotificationGrantedOrAsk()) {
    return new window.Notification(message);
  }

  return Promise.reject(new Error('Browser notifications is not granted'));
};
