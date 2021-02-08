import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './style.scss';

class Label extends PureComponent {
  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
      .isRequired,
    htmlFor: PropTypes.string.isRequired,
    className: PropTypes.string,
  };

  static defaultProps = {
    className: null,
  };

  state = {};

  render() {
    const { className, htmlFor, children } = this.props;
    const labelClassName = classnames('m-label', className);

    return (
      <label htmlFor={htmlFor} className={labelClassName}>
        {children}
      </label>
    );
  }
}

export default Label;
