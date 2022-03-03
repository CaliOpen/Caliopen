import * as React from 'react';
import classnames from 'classnames';

interface Props {
  className?: string;
  active?: boolean;
  large?: boolean;
  children?: React.ReactNode;
}
const NavItem = ({
  className,
  active = false,
  large = false,
  ...props
}: Props): JSX.Element => {
  const itemClassName = classnames(
    'm-nav-list__item',
    {
      'm-nav-list__item--large': large,
      'm-nav-list__item--active': active,
    },
    className
  );

  return <li className={itemClassName} {...props} />;
};

export default NavItem;
