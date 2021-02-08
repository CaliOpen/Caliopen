import React from 'react';
import PropTypes from 'prop-types';
import { v1 as uuidV1 } from 'uuid';
import classnames from 'classnames';
import { Trans } from '@lingui/react';
import FieldErrors from '../FieldErrors';
import Label from '../Label';
import Button from '../Button';
import Icon from '../Icon';

import './style.scss';

const InputFile = ({ onChange, className, accept, errors, multiple, id }) => {
  const actualId = id || uuidV1();

  return (
    <div className={classnames('m-input-file', className)}>
      <Label htmlFor={actualId} className="m-input-file__label">
        <Button
          className="m-input-file__label__button"
          icon="plus"
          shape="plain"
        />
        <span className="m-input-file__label__text">
          <Trans id="input-file.add_a_file.label">Add a file</Trans>
        </span>
        <span className="m-input-file__label__icon">
          <Icon type="folder" />
        </span>
        <input
          id={actualId}
          type="file"
          name="files"
          className="m-input-file__input"
          onChange={onChange}
          accept={accept}
          multiple={multiple}
        />
      </Label>
      {errors.length > 0 && <FieldErrors errors={errors} />}
    </div>
  );
};

InputFile.propTypes = {
  onChange: PropTypes.func.isRequired,
  multiple: PropTypes.bool,
  accept: PropTypes.arrayOf(PropTypes.string),
  errors: PropTypes.arrayOf(PropTypes.node),
  className: PropTypes.string,
  id: PropTypes.string,
};

InputFile.defaultProps = {
  className: null,
  errors: null,
  multiple: false,
  accept: undefined,
  id: undefined,
};

export default InputFile;
