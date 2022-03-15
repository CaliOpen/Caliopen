import React from 'react';
import WithDevice from '../../components/WithDevice';

export const withDevice = () => (WrappedComponent) =>
  function (props) {
    return (
      <WithDevice
        render={(deviceProps) => (
          <WrappedComponent {...props} {...deviceProps} />
        )}
      />
    );
  };
