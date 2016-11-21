import React, { PropTypes } from 'react';
import classnames from 'classnames';
import './style.scss';

export const RawButton = ({ children, type = 'button', ...props }) => {
  const buttonProps = {
    ...props,
    type,
  };

  return <button {...buttonProps}>{children}</button>;
};

RawButton.propTypes = {
  type: PropTypes.oneOf(['button', 'submit']),
  children: PropTypes.node.isRequired,
};

const Button = ({ children, className, modifiers = {}, ...props }) => {
  const buttonProps = {
    ...props,
    className: classnames(
      className,
      'm-button',
      {
        'm-button--expanded': modifiers.expanded,
        'm-button--plain': modifiers.plain,
        'm-button--hollow': modifiers.hollow,
      }
    ),
  };

  return <RawButton {...buttonProps}>{children}</RawButton>;
};

Button.propTypes = {
  className: PropTypes.string,
  modifiers: PropTypes.shape({ plain: PropTypes.bool, hollow: PropTypes.bool }),
  children: PropTypes.node.isRequired,
};

export default Button;
