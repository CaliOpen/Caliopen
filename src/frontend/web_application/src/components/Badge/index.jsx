import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Link as BaseLink } from 'react-router-dom';
import Button from '../Button';
import Spinner from '../Spinner';
import './style.scss';

class Badge extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    large: PropTypes.bool,
    low: PropTypes.bool,
    radiusType: PropTypes.oneOf(['no', 'normal', 'rounded']),
    color: PropTypes.oneOf(['success', 'alert', 'secondary', 'active']),
    onDelete: PropTypes.func, // If onDelete is set, the delete button will be shown
    ariaLabel: PropTypes.string, // option to show aria-label on delete button
    isLoading: PropTypes.bool, // option to show spinner on delete button
    rightSpaced: PropTypes.bool,
    to: PropTypes.string,
  };

  static defaultProps = {
    children: undefined,
    className: undefined,
    large: false,
    low: false,
    radiusType: 'normal',
    color: undefined,
    onDelete: undefined,
    ariaLabel: null,
    isLoading: false,
    rightSpaced: false,
    to: undefined,
  };

  renderChildren() {
    const { to, children, large, onDelete } = this.props;

    const textClassName = classnames('m-badge__text', {
      'm-badge__text--large': large,
      'm-badge__text--has-button': onDelete,
    });

    if (!to) {
      return <span className={textClassName}>{children}</span>;
    }

    return (
      <BaseLink to={to} className={textClassName}>
        {children}
      </BaseLink>
    );
  }

  render() {
    const {
      children,
      className,
      onDelete,
      low,
      large,
      radiusType,
      isLoading,
      ariaLabel,
      rightSpaced,
      color,
      to,
      ...props
    } = this.props;

    const badgeProps = {
      className: classnames(
        'm-badge',
        {
          'm-badge--low': low,
          'm-badge--large': large,
          'm-badge--no-radius': radiusType === 'no',
          'm-badge--normal-radius': radiusType === 'normal',
          'm-badge--rounded-radius': radiusType === 'rounded',
          'm-badge--right-spaced': rightSpaced,
          'm-badge--active': color === 'active',
          'm-badge--alert': color === 'alert',
          'm-badge--secondary': color === 'secondary',
          'm-badge--success': color === 'success',
          'm-badge--is-link': to !== undefined,
        },
        className
      ),
      ...props,
    };

    const buttonClassName = classnames('m-badge__button', {
      'm-badge__button--large': large,
    });

    return (
      <span {...badgeProps}>
        {children && this.renderChildren()}
        {onDelete && (
          <Button
            className={buttonClassName}
            display="inline"
            onClick={onDelete}
            icon={isLoading ? <Spinner isLoading display="inline" /> : 'remove'}
            aria-label={ariaLabel}
          />
        )}
      </span>
    );
  }
}

export default Badge;
