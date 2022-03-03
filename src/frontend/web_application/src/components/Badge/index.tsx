import classnames from 'classnames';
import * as React from 'react';
import { Link as BaseLink } from 'react-router-dom';
import Button from '../Button';
import Spinner from '../Spinner';
import './style.scss';

interface Props {
  children: React.ReactNode;
  className?: string;
  large?: boolean;
  low?: boolean;
  radiusType?: 'no' | 'normal' | 'rounded';
  color?: 'success' | 'alert' | 'secondary' | 'active';
  onDelete?: () => void; // If onDelete is set, the delete button will be shown
  ariaLabel?: string; // option to show aria-label on delete button
  isLoading?: boolean; // option to show spinner on delete button
  rightSpaced?: boolean;
  to?: string;
}
function Badge({
  children,
  className,
  large = false,
  low = false,
  radiusType = 'normal',
  color,
  onDelete,
  ariaLabel,
  isLoading = false,
  rightSpaced = false,
  to,
}: Props): JSX.Element {
  const textClassName = classnames('m-badge__text', {
    'm-badge__text--large': large,
    'm-badge__text--has-button': onDelete,
  });

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
  };

  const buttonClassName = classnames('m-badge__button', {
    'm-badge__button--large': large,
  });

  return (
    <span {...badgeProps}>
      {children &&
        (to ? (
          <BaseLink to={to} className={textClassName}>
            {children}
          </BaseLink>
        ) : (
          <span className={textClassName}>{children}</span>
        ))}
      {onDelete && (
        <Button
          className={buttonClassName}
          display="inline"
          onClick={onDelete}
          icon={
            isLoading ? (
              <Spinner svgTitleId="badge-spinner" isLoading display="inline" />
            ) : (
              'remove'
            )
          }
          aria-label={ariaLabel}
        />
      )}
    </span>
  );
}

export default Badge;
