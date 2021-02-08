import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { v4 as uuidv4 } from 'uuid';
import Label from '../Label';
import './style.scss';

class Checkbox extends Component {
  static propTypes = {
    label: PropTypes.node.isRequired,
    id: PropTypes.string,
    indeterminate: PropTypes.bool,
    showLabelforSr: PropTypes.bool,
    className: PropTypes.string,
  };

  static defaultProps = {
    id: uuidv4(),
    indeterminate: null,
    showLabelforSr: false,
    className: undefined,
  };

  state = {};

  componentDidMount() {
    // apply the indeterminate attribute of the real checkbox element
    this.selector.indeterminate = this.props.indeterminate;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.indeterminate !== this.props.indeterminate) {
      this.selector.indeterminate = this.props.indeterminate;
    }
  }

  render() {
    const {
      id,
      label,
      showLabelforSr,
      indeterminate,
      className,
      ...inputProps
    } = this.props;

    return (
      <div className={classnames(className, 'm-checkbox')}>
        <input
          type="checkbox"
          className="m-checkbox__input"
          ref={(el) => {
            this.selector = el;
          }}
          id={id}
          {...inputProps}
        />
        <Label
          className={classnames('m-checkbox__label', {
            'show-for-sr': showLabelforSr,
          })}
          htmlFor={id}
        >
          {label}
        </Label>
      </div>
    );
  }
}

export default Checkbox;
