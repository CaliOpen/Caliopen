import * as React from 'react';
import PropTypes from 'prop-types';
import './style.scss';

export interface Props
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  label: React.ReactNode;
  id: string;
}
function Switch({ label, id, ...inputProps }: Props) {
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
}

Switch.propTypes = {
  label: PropTypes.node.isRequired,
  id: PropTypes.string.isRequired,
};

export default Switch;
