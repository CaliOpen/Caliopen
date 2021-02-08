import React, { PureComponent, forwardRef, createRef } from 'react';
import PropTypes from 'prop-types';
import { v1 as uuidV1 } from 'uuid';
import classnames from 'classnames';
import Label from '../Label';
import FieldGroup from '../FieldGroup';
import Dropdown, { withDropdownControl } from '../Dropdown';
import VerticalMenu, { VerticalMenuItem } from '../VerticalMenu';
import TextBlock from '../TextBlock';
import Button from '../Button';

import './style.scss';

const propTypeOption = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
]);
const alphaNumPropType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
]);

const DropdownControl = withDropdownControl(
  forwardRef((props, ref) => <div ref={ref} {...props} />)
);

class AdvancedSelectFieldGroup extends PureComponent {
  static propTypes = {
    label: PropTypes.node,
    showLabelforSr: PropTypes.bool,
    value: alphaNumPropType,
    expanded: PropTypes.bool,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        advancedlabel: PropTypes.node,
        label: propTypeOption,
        value: alphaNumPropType,
      })
    ),
    errors: PropTypes.arrayOf(PropTypes.node),
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    name: PropTypes.string,
    placeholder: PropTypes.node,
    decorated: PropTypes.bool,
    inline: PropTypes.bool,
  };

  static defaultProps = {
    label: null,
    showLabelforSr: false,
    value: null,
    expanded: false,
    options: [],
    errors: [],
    className: null,
    name: undefined,
    placeholder: null,
    decorated: false,
    inline: false,
  };

  dropdownControlRef = createRef();

  createHandleClick = (value) => () => {
    const { name, onChange } = this.props;

    onChange({ target: { name, value } });
  };

  renderSelected = (
    selectedOpt = { advancedlabel: this.props.placeholder }
  ) => {
    const { inline } = this.props;
    const { advancedlabel } = selectedOpt;

    if (inline) {
      return advancedlabel;
    }

    return <TextBlock>{advancedlabel}</TextBlock>;
  };

  render() {
    const {
      errors,
      expanded,
      showLabelforSr,
      className,
      label,
      onChange,
      options,
      value,
      placeholder,
      decorated,
      inline,
      ...props
    } = this.props;
    if (decorated) {
      throw new Error('decorated prop is not supported yet');
    }

    const id = uuidV1();
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
      'm-advanced-select-field-group__input--decorated': decorated,
      'm-advanced-select-field-group__input--has-placeholder': !!selectedOpt,
    });
    const errorsClassname = classnames(
      'm-advanced-select-field-group__errors',
      {
        'm-advanced-select-field-group--inline__errors': inline,
      }
    );

    return (
      <FieldGroup
        className={selectClassName}
        errorsClassname={errorsClassname}
        errors={errors}
      >
        <Label htmlFor={id} className={labelClassName}>
          {label}
        </Label>
        <div className={selectWrapperClassName} aria-hidden="true">
          <DropdownControl
            className={inputClassName}
            ref={this.dropdownControlRef}
          >
            <TextBlock>{this.renderSelected(selectedOpt)}</TextBlock>
          </DropdownControl>
        </div>
        <Dropdown
          dropdownControlRef={this.dropdownControlRef}
          isMenu
          closeOnClick="all"
        >
          <VerticalMenu>
            {options.map((option) => (
              <VerticalMenuItem key={option.value}>
                <Button
                  onClick={this.createHandleClick(option.value)}
                  display="expanded"
                  className="m-advanced-select-field-group__option-button"
                >
                  <TextBlock>{option.advancedlabel}</TextBlock>
                </Button>
              </VerticalMenuItem>
            ))}
          </VerticalMenu>
        </Dropdown>
        <select
          onChange={onChange}
          className="show-for-sr"
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
      </FieldGroup>
    );
  }
}

export default AdvancedSelectFieldGroup;
