import * as React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { isBoolean } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import Label from '../Label';
import './style.scss';

interface Props
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  label: React.ReactNode;
  id?: string;
  indeterminate?: boolean;
  showLabelforSr?: boolean;
  className?: string;
}

class Checkbox extends React.Component<Props> {
  static propTypes = {
    label: PropTypes.node.isRequired,
    id: PropTypes.string,
    indeterminate: PropTypes.bool,
    showLabelforSr: PropTypes.bool,
    className: PropTypes.string,
  };

  static defaultProps = {
    id: undefined,
    indeterminate: null,
    showLabelforSr: false,
    className: undefined,
  };

  state = {};

  selector: null | HTMLInputElement = null;

  componentDidMount() {
    // apply the indeterminate attribute of the real checkbox element
    if (this.selector && isBoolean(this.props.indeterminate)) {
      this.selector.indeterminate = this.props.indeterminate;
    }
  }

  componentDidUpdate(prevProps) {
    if (
      this.selector &&
      isBoolean(this.props.indeterminate) &&
      prevProps.indeterminate !== this.props.indeterminate
    ) {
      this.selector.indeterminate = this.props.indeterminate;
    }
  }

  render() {
    const {
      id = uuidv4(),
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
