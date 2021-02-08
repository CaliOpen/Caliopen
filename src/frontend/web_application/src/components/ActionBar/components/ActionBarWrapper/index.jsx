import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './styles.scss';

const ActionBarWrapper = ({ isSticky, className, ...props }) => (
  <div
    className={classnames(className, 'm-action-bar-wrapper', {
      'm-action-bar-wrapper--sticky': isSticky,
    })}
    {...props}
  />
);

ActionBarWrapper.propTypes = {
  className: PropTypes.string,
  isSticky: PropTypes.bool,
};
ActionBarWrapper.defaultProps = {
  className: undefined,
  isSticky: false,
};

export default ActionBarWrapper;
