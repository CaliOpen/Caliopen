import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './style.scss';

class Callout extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    color: PropTypes.oneOf(['success', 'info', 'warning', 'alert']),
  };

  static defaultProps = {
    children: null,
    className: undefined,
    color: undefined,
  };

  render() {
    const { className, children, color } = this.props;

    const calloutClassName = classnames(className, 'm-callout', {
      'm-callout--success': color === 'success',
      'm-callout--info': color === 'info',
      'm-callout--warning': color === 'warning',
      'm-callout--alert': color === 'alert',
    });

    return <div className={calloutClassName}>{children}</div>;
  }
}

export default Callout;
