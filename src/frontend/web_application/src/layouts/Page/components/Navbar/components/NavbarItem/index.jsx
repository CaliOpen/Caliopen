import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './style.scss';

const renderComponent = (C, className) => {
  const { className: originalClassName, ...props } = C.props;
  const componentProps = {
    ...props,
    className: classnames(className, originalClassName),
  };

  return <C.type {...componentProps} />;
};

class NavbarItem extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    active: PropTypes.bool,
    contentChildren: PropTypes.node,
    actionChildren: PropTypes.node,
    children: PropTypes.node,
    color: PropTypes.oneOf(['secondary', 'contrasted']),
  };

  static defaultProps = {
    className: undefined,
    active: false,
    contentChildren: null,
    actionChildren: null,
    children: null,
    color: undefined,
  };

  state = {};

  render() {
    const {
      className,
      active,
      contentChildren,
      actionChildren,
      children,
      color,
      ...props
    } = this.props;

    const navbarItemProps = {
      ...props,
      className: classnames('m-navbar-item', className, {
        'm-navbar-item--is-active': active,
        'm-navbar-item--secondary': color === 'secondary',
        'm-navbar-item--contrasted': color === 'contrasted',
      }),
    };

    return (
      <div {...navbarItemProps}>
        {contentChildren &&
          renderComponent(contentChildren, 'm-navbar-item__content')}
        {actionChildren &&
          renderComponent(actionChildren, 'm-navbar-item__action')}
        {children}
      </div>
    );
  }
}

export default NavbarItem;
