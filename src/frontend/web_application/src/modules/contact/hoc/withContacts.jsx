import React from 'react';
import WithContactsBase from '../components/WithContacts';

export const withContacts = () => (WrappedComp) => {
  function WithContacts(props) {
    return (
      <WithContactsBase
        render={({ contacts }) => (
          <WrappedComp contacts={contacts} {...props} />
        )}
      />
    );
  }
  WithContacts.displayName = `(${
    WrappedComp.displayName || WrappedComp.name || 'Component'
  })`;

  return WithContacts;
};
