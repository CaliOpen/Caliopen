import React, { PropTypes } from 'react';

const style = {
  code: {
    margin: '1rem',
    padding: '1rem',
    backgroundColor: '#333',
  },
};

const Code = ({ children }) => (
  <code><pre style={style.code}>{children}</pre></code>
);

Code.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Code;
