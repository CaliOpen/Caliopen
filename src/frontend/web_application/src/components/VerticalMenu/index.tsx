import * as React from 'react';
import classnames from 'classnames';
import './style.scss';

export function Separator() {
  return <li className="m-vertical-menu__separator" />;
}

interface VerticalMenuItemProps {
  children: React.ReactNode;
  className?: string;
}

export function VerticalMenuItem({
  children,
  className,
  ...props
}: VerticalMenuItemProps) {
  const itemProps = {
    ...props,
    className: classnames('m-vertical-menu__item', className),
  };

  return <li {...itemProps}>{children}</li>;
}

export function VerticalMenuTextItem(props: VerticalMenuItemProps) {
  return (
    <VerticalMenuItem {...props} className="m-vertical-menu__item-content" />
  );
}

interface VerticalMenuProps {
  children: React.ReactNode;
  className?: string;
}
function VerticalMenu({ children, className }: VerticalMenuProps) {
  return (
    <ul className={classnames('m-vertical-menu', className)}>{children}</ul>
  );
}

export default VerticalMenu;
