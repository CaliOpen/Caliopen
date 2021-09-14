import * as React from 'react';
import classnames from 'classnames';
import './style.scss';

type Size = 'shrink' | 'small' | 'medium' | 'large';

interface FormColumnProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  bottomSpace?: boolean;
  size?: Size;
  fluid?: boolean;
  rightSpace?: boolean;
}
export const FormColumn = ({
  className,
  bottomSpace,
  size,
  fluid,
  rightSpace = true, // --right-space style is default for FormColumn
  ...props
}: FormColumnProps) => {
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

interface FormRowProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  reverse?: boolean;
}

export const FormRow = ({ className, reverse, ...props }: FormRowProps) => {
  const rowClassName = classnames(
    'm-form-grid__row',
    {
      'm-form-grid__row--reverse': reverse,
    },
    className
  );

  return <div className={rowClassName} {...props} />;
};

interface FormGridProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  reverse?: boolean;
}

const FormGrid = ({ className, ...props }: FormGridProps) => (
  <div className={classnames('m-form-grid', className)} {...props} />
);

export default FormGrid;
