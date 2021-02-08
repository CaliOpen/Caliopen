import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './style.scss';

const Subtitle = ({ children, actions, hr, className, ...props }) => (
  <div
    className={classnames('m-subtitle', { 'm-subtitle--hr': hr }, className)}
    {...props}
  >
    <h3 className="m-subtitle__text">{children}</h3>
    {actions && <span className="m-subtitle__actions">{actions}</span>}
  </div>
);

Subtitle.propTypes = {
  children: PropTypes.node.isRequired,
  actions: PropTypes.node,
  hr: PropTypes.bool,
  className: PropTypes.string,
};
Subtitle.defaultProps = {
  actions: undefined,
  hr: false,
  className: undefined,
};

export default Subtitle;
