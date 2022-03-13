import React from 'react';
import { Notify } from 'react-redux-notify';
import 'react-redux-notify/dist/ReactReduxNotify.css';
import './style.scss';

const notificationCustomStyles = {
  containerTopRight: 'l-notification-center',
};

function NotificationCenter() {
  return <Notify customStyles={notificationCustomStyles} />;
}

export default NotificationCenter;
