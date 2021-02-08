import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './style.scss';

class SidebarLayout extends PureComponent {
  static propTypes = {
    sidebar: PropTypes.node,
    children: PropTypes.node,
    className: PropTypes.string,
    sidebarClassName: PropTypes.string,
    panelClassName: PropTypes.string,
  };

  static defaultProps = {
    sidebar: null,
    children: null,
    className: undefined,
    sidebarClassName: undefined,
    panelClassName: undefined,
  };

  render() {
    const {
      className,
      sidebarClassName,
      panelClassName,
      sidebar,
      children,
    } = this.props;

    return (
      <div className={classnames(className, 'm-sidebar-layout')}>
        <div className={classnames(sidebarClassName, 'm-sidebar-layout__left')}>
          {sidebar}
        </div>
        <div className={classnames(panelClassName, 'm-sidebar-layout__panel')}>
          {children}
        </div>
      </div>
    );
  }
}

export default SidebarLayout;
