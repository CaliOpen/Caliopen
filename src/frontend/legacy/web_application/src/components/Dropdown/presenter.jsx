import React, { PropTypes } from 'react';
import classnames from 'classnames';

export const Raw = ({ children, ...props }) => (
  <div {...props}>
    {children}
  </div>
);

Raw.propTypes = {
  children: PropTypes.node.isRequired,
};

const Presenter = ({ className, ...props }) => {
  const presenterProps = {
    ...props,
    className: classnames('m-dropdown', className),
  };

  return (
    <Raw {...presenterProps} />
  );
};

Presenter.propTypes = {
  className: PropTypes.string,
};

export default Presenter;
