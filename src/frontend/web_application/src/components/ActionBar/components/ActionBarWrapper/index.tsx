import classnames from 'classnames';
import * as React from 'react';
import './styles.scss';

interface Props {
  isSticky?: boolean;
  children: React.ReactNode;
}

function ActionBarWrapper({ isSticky = false, ...props }: Props) {
  return <div
    className={classnames('m-action-bar-wrapper', {
      'm-action-bar-wrapper--sticky': isSticky,
    })}
    {...props}
  />
}

export default ActionBarWrapper;
