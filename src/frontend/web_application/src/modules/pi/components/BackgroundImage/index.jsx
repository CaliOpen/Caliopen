import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import './style.scss';

class BackgroundImage extends PureComponent {
  static propTypes = {
    children: PropTypes.element.isRequired,
    context: PropTypes.string.isRequired,
    className: PropTypes.string,
  };

  static defaultProps = {
    className: undefined,
  };

  render() {
    const { context, children, className } = this.props;

    return (
      <div
        className={classnames(className, 'm-background-image', {
          'm-background-image--secure': context === 'secure',
          // 'm-background-image--public': context === 'public',
        })}
      >
        {children}
      </div>
    );
  }
}

export default BackgroundImage;
