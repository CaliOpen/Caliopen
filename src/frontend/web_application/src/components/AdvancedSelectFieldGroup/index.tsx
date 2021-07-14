import * as React from 'react';
import { v1 as uuidV1 } from 'uuid';
import classnames from 'classnames';
import Label from '../Label';
import FieldGroup from '../FieldGroup';
import Dropdown, { withDropdownControl } from '../Dropdown';
import VerticalMenu, { VerticalMenuItem } from '../VerticalMenu';
import TextBlock from '../TextBlock';
import Button from '../Button';

import './style.scss';

const DropdownControl = withDropdownControl(
  React.forwardRef<HTMLDivElement>((props, ref) => {
    // mandatory for A11Y but handled by dropdown event handler
    // FIXME: onKeyDown is actually not handled, but for screen-reader, dropdown is hidden and an actual native select is provided
    const handleEv = () => {};
    return (
      <div
        role="button"
        onClick={handleEv}
        onKeyDown={handleEv}
        ref={ref}
        {...props}
      />
    );
  })
);

interface Option {
  advancedlabel?: React.ReactNode;
  label: string | number;
  value: string | number;
}

interface Props {
  selectId: string;
  dropdownId: string;
  label?: React.ReactNode;
  showLabelforSr?: boolean;
  value: undefined | string | number;
  expanded?: boolean;
  options: Option[];
  errors?: React.ReactNode[];
  onChange: (value: string | number) => void;
  className?: string;
  placeholder?: React.ReactNode;
  inline?: boolean;
}

function AdvancedSelectFieldGroup({
  selectId,
  dropdownId,
  label,
  showLabelforSr = false,
  value,
  expanded = false,
  options = [],
  errors,
  onChange,
  className,
  placeholder = null,
  inline = false,
}: Props) {
  const dropdownControlRef = React.useRef<HTMLDivElement>(null);

  const createHandleClick = (value) => () => {
    onChange(value);
  };

  const handleRawChange: React.ChangeEventHandler<HTMLSelectElement> = (ev) => {
    onChange(ev.currentTarget.value);
  };

  const renderSelected = ({ advancedlabel, label }: Partial<Option> = {}) => {
    const text = advancedlabel || label || placeholder;
    if (inline) {
      return text;
    }

    return <TextBlock>{text}</TextBlock>;
  };

  const selectedOpt = options.find((opt) => opt.value === value);
  const selectClassName = classnames(
    className,
    'm-advanced-select-field-group',
    { 'm-advanced-select-field-group--inline': inline }
  );
  const selectWrapperClassName = classnames(
    'm-advanced-select-field-group__select-wrapper',
    {
      'm-advanced-select-field-group--expanded__select-wrapper': expanded,
      'm-advanced-select-field-group--inline__select-wrapper': inline,
    }
  );
  const labelClassName = classnames('m-advanced-select-field-group__label', {
    'm-advanced-select-field-group--inline__label': inline,
    'show-for-sr': showLabelforSr,
  });
  const inputClassName = classnames('m-advanced-select-field-group__input', {
    'm-advanced-select-field-group--inline__input': inline,
    'm-advanced-select-field-group__input--has-placeholder': !!selectedOpt,
  });
  const errorsClassname = classnames('m-advanced-select-field-group__errors', {
    'm-advanced-select-field-group--inline__errors': inline,
  });

  return (
    <FieldGroup
      className={selectClassName}
      errorsClassname={errorsClassname}
      errors={errors}
    >
      <Label htmlFor={selectId} className={labelClassName}>
        {label}
      </Label>
      <div className={selectWrapperClassName} aria-hidden="true">
        <DropdownControl className={inputClassName} ref={dropdownControlRef}>
          {renderSelected(selectedOpt)}
        </DropdownControl>
      </div>
      <Dropdown
        id={dropdownId}
        className="hide-for-sr" // is it working?
        dropdownControlRef={dropdownControlRef}
        isMenu
        closeOnClick="all"
      >
        <VerticalMenu>
          {options.map((option) => (
            <VerticalMenuItem key={option.value}>
              <Button
                onClick={createHandleClick(option.value)}
                display="expanded"
                className="m-advanced-select-field-group__option-button"
              >
                <TextBlock>{option.advancedlabel || option.label}</TextBlock>
              </Button>
            </VerticalMenuItem>
          ))}
        </VerticalMenu>
      </Dropdown>
      <select
        onChange={handleRawChange}
        className="show-for-sr"
        id={selectId}
        value={value}
      >
        {options.map((selectOption) => (
          <option key={selectOption.label} value={selectOption.value}>
            {selectOption.label}
          </option>
        ))}
      </select>
    </FieldGroup>
  );
}

export default AdvancedSelectFieldGroup;
