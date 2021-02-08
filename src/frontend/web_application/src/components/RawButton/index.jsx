import React, { PureComponent, forwardRef } from 'react';
import PropTypes from 'prop-types';

class RawButton extends PureComponent {
  static propTypes = {
    type: PropTypes.oneOf(['button', 'submit']),
    children: PropTypes.node.isRequired,
    innerRef: PropTypes.shape({ current: PropTypes.shape({}) }),
  };

  static defaultProps = {
    type: 'button',
    innerRef: undefined,
  };

  render() {
    const { children, type, innerRef, ...buttonProps } = this.props;

    // this rules does not understand vars (2019-04-05)
    return (
      // eslint-disable-next-line react/button-has-type
      <button type={type} {...buttonProps} ref={innerRef}>
        {children}
      </button>
    );
  }
}

export default forwardRef((props, ref) => (
  <RawButton {...props} innerRef={ref} />
));
