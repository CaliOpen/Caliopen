import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './style.scss';

class InputText extends PureComponent {
  static propTypes = {
    expanded: PropTypes.bool,
    theme: PropTypes.string,
    bottomSpace: PropTypes.bool,
    hasError: PropTypes.bool,
    className: PropTypes.string,
    inputRef: PropTypes.func,
  };

  static defaultProps = {
    expanded: false,
    theme: 'light',
    bottomSpace: false,
    hasError: false,
    className: null,
    inputRef: undefined,
  };

  state = {};

  render() {
    const {
      expanded,
      theme,
      bottomSpace,
      className,
      hasError,
      inputRef,
      ...props
    } = this.props;
    const inputTextClassName = classnames(
      'm-input-text',
      {
        'm-input-text--expanded': expanded,
        'm-input-text--light': theme === 'light',
        'm-input-text--dark': theme === 'dark',
        'm-input-text--contrasted': theme === 'contrasted',
        'm-input-text--bottom-space': bottomSpace,
        'm-input-text--error': hasError,
      },
      className
    );

    return (
      <input
        type="text"
        className={inputTextClassName}
        ref={inputRef}
        {...props}
      />
    );
  }
}

export default InputText;
