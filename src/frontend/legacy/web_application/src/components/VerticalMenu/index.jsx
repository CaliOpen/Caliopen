import React, { PropTypes } from 'react';
import classnames from 'classnames';
import './style.scss';

export const Separator = () => (
  <li className="m-vertical-menu__separator" />
);

export const VerticalMenuItem = ({ children, className, ...props }) => {
  const itemProps = {
    ...props,
    className: classnames('m-vertical-menu__item', className),
  };

  return (
    <li {...itemProps}>{children}</li>
  );
};

VerticalMenuItem.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export const VerticalMenuTextItem = props => (
  <VerticalMenuItem {...props} className="m-vertical-menu__item-content" />
);

const VerticalMenu = ({ children, className }) => (
  <ul className={classnames('m-vertical-menu', className)}>{children}</ul>
);

VerticalMenu.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};


export default VerticalMenu;
