import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import './style.scss';

class Textarea extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    expanded: PropTypes.bool,
  };

  static defaultProps = {
    className: undefined,
    expanded: true,
  };

  render() {
    const { className, expanded, ...props } = this.props;

    return (
      <textarea
        className={classnames(
          'm-textarea',
          { 'm-textarea--expanded': expanded },
          className
        )}
        {...props}
      />
    );
  }
}

export default Textarea;
