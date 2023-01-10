import * as React from 'react';
import classnames from 'classnames';
import './style.scss';

interface Props {
  children: React.ReactNode;
  actions?: React.ReactNode;
  hr?: boolean;
  className?: string;
}
function Subtitle({ children, actions, hr, className, ...props }: Props) {
  return (
    <div
      className={classnames('m-subtitle', { 'm-subtitle--hr': hr }, className)}
      {...props}
    >
      <h3 className="m-subtitle__text">{children}</h3>
      {actions && <span className="m-subtitle__actions">{actions}</span>}
    </div>
  );
}

export default Subtitle;
