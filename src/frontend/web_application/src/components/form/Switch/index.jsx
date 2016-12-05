import React, { PropTypes } from 'react';
import { v1 as uuidV1 } from 'uuid';
import './style.scss';

const Switch = ({ label, ...inputProps }) => {
  const id = uuidV1();

  return (
    <div className="m-switch">
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
  );
};

Switch.propTypes = {
  label: PropTypes.string.isRequired,
};

export default Switch;
