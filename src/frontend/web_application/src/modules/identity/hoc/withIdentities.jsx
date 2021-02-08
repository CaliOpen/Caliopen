import React from 'react';
import WithIdentities from '../components/WithIdentities';

export const withIdentities = ({ namespace } = {}) => (WrappedComp) => {
  const C = (props) => (
    <WithIdentities
      render={({ identities, isFetching }) => {
        const localProps = namespace
          ? { [namespace]: { identities, isFetching } }
          : { identities, isFetching };

        return <WrappedComp {...localProps} {...props} />;
      }}
    />
  );
  C.displayName = `C(${
    WrappedComp.displayName || WrappedComp.name || 'Component'
  })`;

  return C;
};
