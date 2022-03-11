import * as React from 'react';
import type { FieldProps } from 'formik';
import { v1 as uuidV1 } from 'uuid';
import classnames from 'classnames';
import Label from '../Label';
import FieldGroup from '../FieldGroup';

import './style.scss';

// const propTypeOption = PropTypes.oneOfType([
//   PropTypes.string,
//   PropTypes.number,
// ]);
// const alphaNumPropType = PropTypes.oneOfType([
//   PropTypes.string,
//   PropTypes.number,
// ]);

const noop = () => {};
interface Props extends React.InputHTMLAttributes<HTMLSelectElement> {
  // id?: string;
  label?: React.ReactNode;
  showLabelforSr?: boolean;
  // value: string | number;
  expanded?: boolean;
  options?: { label: string | number; value: string | number }[];
  errors?: React.ReactNodeArray;
  // onChange?: () => void;
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
  // static propTypes = {
  //   label: PropTypes.node,
  //   showLabelforSr: PropTypes.bool,
  //   value: alphaNumPropType,
  //   expanded: PropTypes.bool,
  //   options: PropTypes.arrayOf(
  //     PropTypes.shape({ label: propTypeOption, value: propTypeOption })
  //   ),
  //   errors: PropTypes.arrayOf(PropTypes.node),
  //   onChange: PropTypes.func,
  //   className: PropTypes.string,
  // };

  // static defaultProps = {
  //   label: null,
  //   showLabelforSr: false,
  //   value: null,
  //   expanded: false,
  //   options: [],
  //   errors: [],
  //   onChange: () => {
  //     // noop
  //   },
  //   className: null,
  // };

  // render() {
  //   const {
  //     id = uuidV1(),
  //     errors,
  //     expanded,
  //     showLabelforSr,
  //     className,
  //     label,
  //     onChange,
  //     options,
  //     ...props
  //   } = this.props;
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
