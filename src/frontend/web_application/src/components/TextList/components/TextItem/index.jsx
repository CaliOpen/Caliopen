import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const TextItem = ({ className, large, ...props }) => {
  const itemClassName = classnames(
    'm-text-list__item',
    {
      'm-text-list__item--large': large,
    },
    className
  );

  return <li className={itemClassName} {...props} />;
};

TextItem.propTypes = {
  large: PropTypes.bool,
  className: PropTypes.string,
};
TextItem.defaultProps = {
  large: false,
  className: undefined,
};

export default TextItem;
