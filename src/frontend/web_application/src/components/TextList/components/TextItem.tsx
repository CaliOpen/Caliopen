import * as React from 'react';
import classnames from 'classnames';

interface Props {
  large?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function TextItem({
  className,
  large = false,
  ...props
}: Props): JSX.Element {
  const itemClassName = classnames(
    'm-text-list__item',
    {
      'm-text-list__item--large': large,
    },
    className
  );

  return <li className={itemClassName} {...props} />;
}

export default TextItem;
