import * as React from 'react';
import classnames from 'classnames';
import './style.scss';

type Intent = 'success' | 'info' | 'warning' | 'alert';

interface Props {
  className?: string;
  children: React.ReactNode;
  color?: Intent;
}
function Callout({ className, children, color }: Props) {
  const calloutClassName = classnames(className, 'm-callout', {
    'm-callout--success': color === 'success',
    'm-callout--info': color === 'info',
    'm-callout--warning': color === 'warning',
    'm-callout--alert': color === 'alert',
  });

  return <div className={calloutClassName}>{children}</div>;
}

export default Callout;
