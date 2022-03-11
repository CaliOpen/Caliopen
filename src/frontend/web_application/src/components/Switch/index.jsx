import React from 'react';
import PropTypes from 'prop-types';
import './style.scss';

function Switch({ label, id, ...inputProps }) {
  return <div className="m-switch">
    <input
      type="checkbox"
      className="m-switch__input"
      id={id}
      {...inputProps}
    />
    <label className="m-switch__paddle" htmlFor={id}>
      <span className="show-for-sr">{label}</span>
    </label>
  </div>
}

Switch.propTypes = {
  label: PropTypes.node.isRequired,
  id: PropTypes.string.isRequired,
};

export default Switch;
