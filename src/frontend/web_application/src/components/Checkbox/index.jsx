import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Label from '../Label';
import './style.scss';

class Checkbox extends Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    indeterminate: PropTypes.bool,
    showLabelforSr: PropTypes.bool,
  };

  static defaultProps = {
    indeterminate: null,
    showLabelforSr: false,
  };

  state = {}

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
      id, label, showLabelforSr, indeterminate, ...inputProps
    } = this.props;

    return (
      <div className="m-checkbox">
        <input
          type="checkbox"
          className="m-checkbox__input"
          ref={(el) => { this.selector = el; }}
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
