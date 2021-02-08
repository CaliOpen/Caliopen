import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Spinner from '../Spinner';
import './style.scss';

class ActionBar extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    isLoading: PropTypes.bool,
    actionsNode: PropTypes.node,
    hr: PropTypes.bool,
  };

  static defaultProps = {
    children: null,
    className: undefined,
    isLoading: false,
    hr: true,
    actionsNode: null,
  };

  render() {
    const { className, isLoading, actionsNode, hr, children } = this.props;

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
          <Spinner isLoading={isLoading} display="inline" />
        </div>
        {actionsNode && (
          <div className="m-action-bar__actions">{actionsNode}</div>
        )}
        {children}
      </div>
    );
  }
}

export default ActionBar;
export { default as ActionBarButton } from './components/ActionBarButton';
export { default as ActionBarWrapper } from './components/ActionBarWrapper';
