import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { RawButton } from '../../../../components';
import './style.scss';

class ProviderButton extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
  };

  static defaultProps = {
    children: null,
    className: undefined,
  };

  render() {
    const { className, children, ...props } = this.props;

    return (
      <RawButton
        className={classnames(className, 'm-provider-button')}
        {...props}
      >
        {children}
      </RawButton>
    );
  }
}

export default ProviderButton;
