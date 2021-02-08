import React from 'react';
import PropTypes from 'prop-types';
import AuthPage from '../../../../src/layouts/AuthPage';

const Error = ({ error }) => (
  <AuthPage>
    <center>
      <h2>
        Error {error.status}: {error.message}{' '}
      </h2>
    </center>

    {error.stack && <pre>{error.stack}</pre>}
  </AuthPage>
);

Error.propTypes = {
  error: PropTypes.shape({}),
};

export default Error;
