import React from 'react';
import { useDevice } from '../../hooks/useDevice';

/**
 * @deprecated use `useDevice` instead
 */
export const withDevice = () => (WrappedComponent) =>
  function (props) {
    const deviceProps = useDevice();
    return <WrappedComponent {...props} {...deviceProps} />;
  };
