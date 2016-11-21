import React, { PropTypes } from 'react';
import classnames from 'classnames';
import './style.scss';

const Tab = ({ className, active, last, ...props }) => {
  const navbarItemProps = {
    ...props,
    className: classnames('m-tab', className, {
      'm-tab--is-active': active,
      'm-tab--last': last,
    }),
  };

  return (
    <div {...navbarItemProps} />
  );
};

Tab.propTypes = {
  className: PropTypes.string,
  active: PropTypes.bool,
  last: PropTypes.bool,
};

export default Tab;
