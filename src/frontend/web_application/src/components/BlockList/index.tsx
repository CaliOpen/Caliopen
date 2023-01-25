import * as React from 'react';
import classnames from 'classnames';
import './style.scss';

interface Props {
  className?: string;
  children: React.ReactNode[];
}
function BlockList({ className, children, ...props }: Props) {
  return (
    <ul className={classnames('m-block-list', className)} {...props}>
      {children.map((comp, key) => (
        <li className="m-block-list__item" key={key}>
          {comp}
        </li>
      ))}
    </ul>
  );
}

export default BlockList;
