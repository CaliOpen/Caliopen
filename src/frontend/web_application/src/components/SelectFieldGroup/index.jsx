import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { v1 as uuidV1 } from 'uuid';
import classnames from 'classnames';
import Label from '../Label';
import FieldGroup from '../FieldGroup';

import './style.scss';

const propTypeOption = PropTypes.oneOfType([PropTypes.string, PropTypes.number]);
const alphaNumPropType = PropTypes.oneOfType([PropTypes.string, PropTypes.number]);

class SelectFieldGroup extends PureComponent {
  static propTypes = {
    label: PropTypes.string,
    showLabelforSr: PropTypes.bool,
    value: alphaNumPropType,
    expanded: PropTypes.bool,
    options: PropTypes.arrayOf(PropTypes.shape({ label: propTypeOption, value: propTypeOption })),
    errors: PropTypes.arrayOf(PropTypes.node),
    onChange: PropTypes.func,
    className: PropTypes.string,
  };

  static defaultProps = {
    label: null,
    showLabelforSr: false,
    value: null,
    expanded: false,
    options: [],
    errors: [],
    onChange: () => {},
    className: null,
  };

  render() {
    const {
      errors, expanded, showLabelforSr, className, label, onChange, options, ...props
    } = this.props;
    const id = uuidV1();
    const selectWrapperClassName = classnames(
      'm-select-field-group__select-wrapper',
      {
        'm-select-field-group--expanded__select-wrapper': expanded,
      }
    );
    const labelClassName = classnames('m-select-field-group__label', {
      'show-for-sr': showLabelforSr,
    });

    return (
      <FieldGroup className={classnames('m-select-field-group', className)} errors={errors}>
        <Label htmlFor={id} className={labelClassName}>{label}</Label>
        <div className={selectWrapperClassName}>
          <select
            onChange={onChange}
            className="m-select-field-group__select"
            id={id}
            {...props}
          >
            {options.map(selectOption => (
              <option
                key={selectOption.label}
                value={selectOption.value}
              >
                {selectOption.label}
              </option>
            ))}
          </select>
        </div>
      </FieldGroup>
    );
  }
}

export default SelectFieldGroup;
