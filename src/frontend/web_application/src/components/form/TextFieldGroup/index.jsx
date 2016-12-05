import React, { PropTypes } from 'react';
import { v1 as uuidV1 } from 'uuid';
import classnames from 'classnames';
import { InputText, FieldErrors } from '..';
import './style.scss';

const TextFieldGroup = ({
  label, errors = [], expanded = true, className, ...inputProps
}) => {
  const id = uuidV1();

  return (
    <div className={classnames('m-text-field-group', className)}>
      <label htmlFor={id} className="m-text-field-group__label">{label}</label>
      <InputText
        id={id} expanded={expanded} {...inputProps}
      />
      { errors.length > 0 && (
        <FieldErrors className="m-text-field-group__errors" errors={errors} />
      )}
    </div>
  );
};

TextFieldGroup.propTypes = {
  label: PropTypes.string.isRequired,
  errors: PropTypes.arrayOf(PropTypes.string),
  expanded: PropTypes.bool,
  className: PropTypes.string,
};

export default TextFieldGroup;
