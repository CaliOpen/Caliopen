import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './style.scss';

class Title extends PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    actions: PropTypes.node,
    hr: PropTypes.bool,
    caps: PropTypes.bool,
    size: PropTypes.oneOf(['medium', 'large']),
    className: PropTypes.string,
  };

  static defaultProps = {
    actions: undefined,
    hr: false,
    caps: false,
    size: 'medium',
    className: undefined,
  };

  render() {
    const {
      children,
      actions,
      hr,
      caps,
      size,
      className,
      ...props
    } = this.props;

    const titleClassName = classnames(
      'm-title',
      {
        'm-title--hr': hr,
        'm-title--caps': caps,
        'm-title--large': size === 'large',
      },
      className
    );

    return (
      <div className={titleClassName} {...props}>
        <h2 className="m-title__text">{children}</h2>
        {actions && <span className="m-title__actions">{actions}</span>}
      </div>
    );
  }
}

export default Title;
