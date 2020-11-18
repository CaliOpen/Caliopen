import * as React from 'react';
import classnames from 'classnames';
import './style.scss';

interface Props {
  inline?: boolean;
  nowrap?: boolean;
  className?: string;
  size?: 'small';
  weight?: 'strong';
  children: React.ReactNode;
}
const TextBlock = ({
  inline = false,
  nowrap = true,
  size,
  weight,
  className,
  children,
  ...props
}: Props) => {
  const textBlockClassName = classnames(
    'm-text-block',
    {
      'm-text-block--inline': inline,
      'm-text-block--nowrap': nowrap,
      'm-text-block--small': size === 'small',
      'm-text-block--strong': weight === 'strong',
    },
    className
  );

  return (
    <span className={textBlockClassName} {...props}>
      {children}
    </span>
  );
};

export default TextBlock;
