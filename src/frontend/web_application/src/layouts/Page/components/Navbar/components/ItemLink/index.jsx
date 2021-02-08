import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Link } from '../../../../../../components';
import './style.scss';

class ItemLink extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
  };

  static defaultProps = {
    className: undefined,
  };

  render() {
    const { className, ...props } = this.props;

    return (
      <Link
        className={classnames('m-item-link', className)}
        noDecoration
        {...props}
      />
    );
  }
}

export default ItemLink;
