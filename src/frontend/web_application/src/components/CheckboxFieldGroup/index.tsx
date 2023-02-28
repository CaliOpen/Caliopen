import * as React from 'react';
import classnames from 'classnames';
import { v1 as uuidV1 } from 'uuid';
import Switch from '../Switch';
import Checkbox from '../Checkbox';
import Label from '../Label';
import FieldGroup from '../FieldGroup';

import './style.scss';

interface Props
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  id?: string;
  className?: string;
  label: React.ReactNode;
  labelClassname?: string;
  showTextLabel?: boolean;
  displaySwitch?: boolean;
  errors?: React.ReactNode[];
}

function CheckboxFieldGroup({
  id,
  label,
  labelClassname,
  className,
  errors,
  showTextLabel,
  displaySwitch,
  ...inputProps
}: Props) {
  const checkboxId = id || uuidV1();

  const renderCheckbox = () => (
    // @ts-ignore
    <Checkbox id={checkboxId} label={label} {...inputProps} />
  );

  const renderSwitch = () => (
    <div>
      <Switch id={checkboxId} label={label} {...inputProps} />
      {showTextLabel && (
        <Label
          htmlFor={checkboxId}
          className={classnames(
            'm-checkbox-field-group__label',
            labelClassname
          )}
        >
          {label}
        </Label>
      )}
    </div>
  );

  return (
    <FieldGroup
      errors={errors}
      className={classnames('m-checkbox-field-group', className)}
    >
      {displaySwitch ? renderSwitch() : renderCheckbox()}
    </FieldGroup>
  );
}

export default CheckboxFieldGroup;
