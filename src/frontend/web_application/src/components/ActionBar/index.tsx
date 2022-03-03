import classnames from 'classnames';
import * as React from 'react';
import Spinner from '../Spinner';
import './style.scss';

interface Props {
  children?: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  actionsNode?: React.ReactNode;
  hr?: boolean;
}

function ActionBar({
  children,
  className,
  isLoading = false,
  actionsNode,
  hr = true,
}: Props): JSX.Element {
  return (
    <div
      className={classnames(className, 'm-action-bar', {
        'm-action-bar--hr': hr,
      })}
    >
      <div
        className={classnames('m-action-bar__loading', {
          'm-action-bar__loading--is-loading': isLoading,
        })}
      >
        <Spinner
          svgTitleId="action-bar-spinner"
          isLoading={isLoading}
          display="inline"
        />
      </div>
      {actionsNode && (
        <div className="m-action-bar__actions">{actionsNode}</div>
      )}
      {children}
    </div>
  );
}

export default ActionBar;
export { default as ActionBarButton } from './components/ActionBarButton';
export { default as ActionBarWrapper } from './components/ActionBarWrapper';
