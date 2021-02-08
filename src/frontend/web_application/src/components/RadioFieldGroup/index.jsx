import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { v1 as uuidV1 } from 'uuid';
import classnames from 'classnames';
import Label from '../Label';
import FieldGroup from '../FieldGroup';

import './style.scss';

const alphaNumPropType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
]);

class RadioFieldGroup extends PureComponent {
  static propTypes = {
    name: PropTypes.string.isRequired,
    value: alphaNumPropType,
    onChange: PropTypes.func,
    options: PropTypes.arrayOf(PropTypes.shape({})),
    errors: PropTypes.arrayOf(PropTypes.node),
    className: PropTypes.string,
  };

  static defaultProps = {
    value: undefined,
    onChange: undefined,
    options: [],
    errors: [],
    className: undefined,
  };

  renderOption = (option, key) => {
    const id = uuidV1();
    const { name, value, onChange } = this.props;

    return (
      <div key={key} className="m-radio-field-group__entry">
        <input
          id={id}
          className="m-radio-field-group__input"
          type="radio"
          name={name}
          checked={value === option.value}
          value={option.value}
          onChange={onChange}
        />{' '}
        <Label className="m-radio-field-group__label" htmlFor={id}>
          {option.label}
        </Label>
      </div>
    );
  };

  render() {
    const { options, errors, className } = this.props;

    return (
      <FieldGroup
        errors={errors}
        className={classnames('m-radio-field-group', className)}
      >
        {options.length > 0 && options.map(this.renderOption)}
      </FieldGroup>
    );
  }
}

export default RadioFieldGroup;
