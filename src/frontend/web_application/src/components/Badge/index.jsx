import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './style.scss';

const Badge = ({
  low, large, className, radiusType, ...props
}) => {
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

Badge.defaultProps = {
  low: false,
  large: false,
  radiusType: 'normal',
  className: undefined,
};

export default Badge;
