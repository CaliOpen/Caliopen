import * as React from 'react';
import { FieldProps } from 'formik';
import { v1 as uuidV1 } from 'uuid';
import classnames from 'classnames';
import Label from '../Label';
import FieldGroup from '../FieldGroup';

import './style.scss';

const noop = () => {};
interface Props extends React.InputHTMLAttributes<HTMLSelectElement> {
  label?: React.ReactNode;
  showLabelforSr?: boolean;
  expanded?: boolean;
  options?: { label: string | number; value: string | number }[];
  errors?: React.ReactNodeArray;
  className?: string;
}
function SelectFieldGroup({
  id = uuidV1(),
  label,
  showLabelforSr = false,
  value,
  expanded = false,
  options = [],
  errors = [],
  onChange = noop,
  className,
  ...props
}: Props): React.ReactElement<typeof FieldGroup> {
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
    <FieldGroup
      className={classnames('m-select-field-group', className)}
      errors={errors}
    >
      <Label htmlFor={id} className={labelClassName}>
        {label}
      </Label>
      <div className={selectWrapperClassName}>
        <select
          onChange={onChange}
          className="m-select-field-group__select"
          id={id}
          value={value}
          {...props}
        >
          {options.map((selectOption) => (
            <option key={selectOption.label} value={selectOption.value}>
              {selectOption.label}
            </option>
          ))}
        </select>
      </div>
    </FieldGroup>
  );
}

export default SelectFieldGroup;

type FormikSelectFieldGroupProps = FieldProps & Props;

export function FormikSelectFieldGroup({
  id,
  label,
  field,
  form,
  meta,
  ...props
}: FormikSelectFieldGroupProps): React.ReactElement<Props> {
  const inputProps = { ...props, ...field };
  return (
    <SelectFieldGroup
      id={id}
      label={label}
      errors={meta?.error ? [meta.error] : undefined}
      {...inputProps}
    />
  );
}
