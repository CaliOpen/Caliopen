import React, { PropTypes } from 'react';
import classnames from 'classnames';
import './style.scss';

const Badge = ({ low, large, className, radiusType = 'normal', ...props }) => {
  const badgeClassName = classnames('m-badge', {
    'm-badge--low': low,
    'm-badge--large': large,
    'm-badge--no-radius': radiusType === 'no',
    'm-badge--normal-radius': radiusType === 'normal',
    'm-badge--rounded-radius': radiusType === 'rounded',
  }, className);

  return (
    <span className={badgeClassName} {...props} />
  );
};

Badge.propTypes = {
  low: PropTypes.bool,
  large: PropTypes.bool,
  radiusType: PropTypes.oneOf(['no', 'normal', 'rounded']),
  className: PropTypes.string,
};

export default Badge;
