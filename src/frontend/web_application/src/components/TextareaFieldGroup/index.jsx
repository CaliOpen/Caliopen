import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { v1 as uuidV1 } from 'uuid';
import classnames from 'classnames';
import Label from '../Label';
import FieldGroup from '../FieldGroup';
import Textarea from '../Textarea';

import './style.scss';

class TextareaFieldGroup extends PureComponent {
  static propTypes = {
    label: PropTypes.node.isRequired,
    showLabelForSR: PropTypes.bool,
    errors: PropTypes.arrayOf(PropTypes.node),
    onChange: PropTypes.func,
    className: PropTypes.string,
    inputProps: PropTypes.shape({}),
  };

  static defaultProps = {
    showLabelForSR: false,
    errors: [],
    onChange: (str) => str,
    className: undefined,
    inputProps: {},
  };

  render() {
    const {
      label,
      errors,
      onChange,
      className,
      inputProps,
      showLabelForSR,
    } = this.props;
    const id = uuidV1();

    return (
      <FieldGroup
        className={classnames('m-textarea-field-group', className)}
        errors={errors}
      >
        <Label
          htmlFor={id}
          className={classnames('m-textarea-field-group__label', {
            'sr-only': showLabelForSR,
          })}
        >
          {label}
        </Label>
        <Textarea id={id} onChange={onChange} {...inputProps} />
      </FieldGroup>
    );
  }
}

export default TextareaFieldGroup;
