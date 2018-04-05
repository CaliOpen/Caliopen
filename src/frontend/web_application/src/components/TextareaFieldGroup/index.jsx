import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { v1 as uuidV1 } from 'uuid';
import classnames from 'classnames';
import Label from '../Label';
import FieldGroup from '../FieldGroup';

import './style.scss';

class TextareaFieldGroup extends PureComponent {
  static propTypes = {
    label: PropTypes.string.isRequired,
    expanded: PropTypes.bool,
    errors: PropTypes.arrayOf(PropTypes.node),
    onChange: PropTypes.func,
    className: PropTypes.string,
  };

  static defaultProps = {
    expanded: true,
    errors: [],
    onChange: str => str,
    className: undefined,
  };

  render() {
    const {
      label, expanded, errors, onChange, className, ...props
    } = this.props;
    const id = uuidV1();
    const textareaClassName = classnames(
      'm-textarea-field-group__textarea',
      {
        'm-textarea-field-group--expanded__textarea': expanded,
      }
    );

    return (
      <FieldGroup className={classnames('m-textarea-field-group', className)} errors={errors} >
        <Label htmlFor={id} className="m-textarea-field-group__label">{label}</Label>
        <textarea
          id={id}
          className={textareaClassName}
          onChange={onChange}
          {...props}
        />
      </FieldGroup>
    );
  }
}

export default TextareaFieldGroup;
