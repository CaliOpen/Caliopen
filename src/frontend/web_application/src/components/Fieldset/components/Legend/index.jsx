import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export class Legend extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
  };

  static defaultProps = {
    className: undefined,
  };

  render() {
    const { className, ...props } = this.props;

    return (
      <legend
        className={classnames('m-fieldset__legend', className)}
        {...props}
      />
    );
  }
}

export default Legend;
