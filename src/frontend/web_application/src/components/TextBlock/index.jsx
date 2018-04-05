import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './style.scss';

const TextBlock = ({
  inline, size, weight, className, ...props
}) => {
  const textBlockClassName = classnames(
    'm-text-block',
    {
      'm-text-block--inline': inline,
      'm-text-block--small': size === 'small',
      'm-text-block--strong': weight === 'strong',
    },
    className
  );

  return (
    <span className={textBlockClassName} {...props} />
  );
};

TextBlock.propTypes = {
  inline: PropTypes.bool,
  className: PropTypes.string,
  size: PropTypes.oneOf(['small']),
  weight: PropTypes.oneOf(['strong']),
};
TextBlock.defaultProps = {
  inline: false,
  className: undefined,
  size: null,
  weight: null,
};

export default TextBlock;
