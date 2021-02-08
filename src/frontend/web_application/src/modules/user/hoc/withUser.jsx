import React from 'react';
import WithUser from '../components/WithUser';

export const withUser = ({ namespace = 'userState' } = {}) => (WrappedComp) => {
  const WithUserHoc = (props) => (
    <WithUser
      render={(user, isFetching, didLostAuth) => {
        const injected = {
          [namespace]: { user, isFetching, didLostAuth },
        };

        return <WrappedComp {...injected} {...props} />;
      }}
    />
  );
  WithUserHoc.displayName = `(${
    WrappedComp.displayName || WrappedComp.name || 'Component'
  })`;

  return WithUserHoc;
};
