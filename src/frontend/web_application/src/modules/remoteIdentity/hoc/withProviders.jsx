import React from 'react';
import WithProviders from '../components/WithProviders';

export const withProviders = () => (WrappedComp) => {
  function Wrapper(props) {
    return (
      <WithProviders
        render={({ providers, isFetching }) => (
          <WrappedComp
            providers={providers}
            providersIsFetching={isFetching}
            {...props}
          />
        )}
      />
    );
  }
  Wrapper.displayName = `Wrapper(${
    WrappedComp.displayName || WrappedComp.name || 'Component'
  })`;

  return Wrapper;
};
