import React from 'react';
import WithDevice from '../../components/WithDevice';

export const withDevice = () => (WrappedComponent) => (props) => (
  <WithDevice
    render={(deviceProps) => <WrappedComponent {...props} {...deviceProps} />}
  />
);
