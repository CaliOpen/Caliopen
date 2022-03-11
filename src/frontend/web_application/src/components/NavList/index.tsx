import * as React from 'react';
import classnames from 'classnames';
import NavItem from './components/NavItem';
import './style.scss';

interface Props {
  className?: string;
  dir?: 'vertical';
  children?: React.ReactNode;
}
function NavList({ className, dir, ...props }: Props): JSX.Element {
  const navClassName = classnames('m-nav-list', {
    'm-nav-list--vertical': dir === 'vertical',
  });

  return (
    <nav className={classnames('m-nav', className)}>
      <ul className={navClassName} {...props} />
    </nav>
  );
}

export { NavItem };

export default NavList;
