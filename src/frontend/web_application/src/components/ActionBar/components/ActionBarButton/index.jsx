import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Button from '../../../Button';

const ActionBarButton = ({ className, innerRef, ...props }) => (
  <Button
    ref={innerRef}
    className={classnames('m-action-bar__action-btn', className)}
    {...props}
  />
);

ActionBarButton.propTypes = {
  className: PropTypes.string,
  innerRef: PropTypes.shape({}),
};
ActionBarButton.defaultProps = {
  className: undefined,
  innerRef: null,
};

export default forwardRef((props, ref) => (
  <ActionBarButton innerRef={ref} {...props} />
));
