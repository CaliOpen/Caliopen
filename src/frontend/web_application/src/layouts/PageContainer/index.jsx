import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './style.scss';

class PageContainer extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
  };
  static defaultProps = {
    className: undefined,
  };

  render() {
    const { children, className } = this.props;

    return (
      <div className={classnames(className, 'l-page-container')}>
        {children}
      </div>
    );
  }
}

export default PageContainer;
