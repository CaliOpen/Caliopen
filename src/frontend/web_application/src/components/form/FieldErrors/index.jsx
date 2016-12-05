import React, { PropTypes } from 'react';
import './style.scss';

const FieldErrors = ({ errors }) => (
  <ul className="m-field-errors">
    { errors.map((error, key) => (
      <li key={key}>{error}</li>
    ))}
  </ul>
);

FieldErrors.propTypes = {
  errors: PropTypes.arrayOf(PropTypes.string),
};

export default FieldErrors;
