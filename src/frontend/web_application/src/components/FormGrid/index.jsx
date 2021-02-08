import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './style.scss';

export const FormColumn = ({
  className,
  bottomSpace,
  size,
  fluid,
  rightSpace,
  ...props
}) => {
  const colClassName = classnames(
    'm-form-grid__column',
    {
      'm-form-grid__column--fluid': fluid,
      'm-form-grid__column--bottom-space': bottomSpace,
      'm-form-grid__column--shrink': size === 'shrink',
      'm-form-grid__column--small': size === 'small',
      'm-form-grid__column--medium': size === 'medium',
      'm-form-grid__column--large': size === 'large',
      'm-form-grid__column--right-space': rightSpace,
    },
    className
  );

  return <div className={colClassName} {...props} />;
};

FormColumn.propTypes = {
  className: PropTypes.string,
  size: PropTypes.oneOf(['shrink', 'small', 'medium', 'large']),
  fluid: PropTypes.bool,
  rightSpace: PropTypes.bool,
  bottomSpace: PropTypes.bool,
};
FormColumn.defaultProps = {
  className: undefined,
  size: undefined,
  fluid: false,
  bottomSpace: false,
  rightSpace: true, // --right-space style is default for FormColumn
};

export const FormRow = ({ className, reverse, ...props }) => {
  const rowClassName = classnames(
    'm-form-grid__row',
    {
      'm-form-grid__row--reverse': reverse,
    },
    className
  );

  return <div className={rowClassName} {...props} />;
};

FormRow.propTypes = {
  className: PropTypes.string,
  reverse: PropTypes.bool,
};
FormRow.defaultProps = {
  className: undefined,
  reverse: false,
};

const FormGrid = ({ className, ...props }) => (
  <div className={classnames('m-form-grid', className)} {...props} />
);

FormGrid.propTypes = {
  className: PropTypes.string,
};
FormGrid.defaultProps = {
  className: undefined,
};

export default FormGrid;
