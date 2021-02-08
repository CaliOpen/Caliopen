import * as React from 'react';

jest.mock('@lingui/react', () => ({
  withI18n: () => (WrappedComponent) => (props) => (
    <WrappedComponent
      i18n={{ _: (id, values, { defaults }) => defaults || id }}
      {...props}
    />
  ),
  i18nMark: (str) => str,
  Trans: ({ id, children }) => {
    if (!children) {
      return id;
    }

    return children;
  },
  NumberFormat: ({ value }) => value,
}));
