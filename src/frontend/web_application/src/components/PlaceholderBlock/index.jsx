import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './style.scss';

class PlaceholderBlock extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    shape: PropTypes.oneOf(['round', 'line', 'rect', 'square', 'avatar']),
    size: PropTypes.oneOf(['small', 'default', 'large']), // XXX: for now only available for avatar
    width: PropTypes.oneOf(['small', 'default', 'large', 'xlarge']), // available only when display is inline-block
    display: PropTypes.oneOf(['inline-block', 'block']),
  };

  static defaultProps = {
    children: ' ',
    className: undefined,
    shape: 'rect',
    size: 'default',
    width: 'default',
    display: 'block',
  };

  render() {
    const { className, shape, display, size, width, ...props } = this.props;
    const modifiers = {
      // 'm-placeholder-block--round': shape === 'round',
      'm-placeholder-block--line': shape === 'line',
      'm-placeholder-block--square': shape === 'square',
      'm-placeholder-block--rect': shape === 'rect',
      'm-placeholder-block--avatar': shape === 'avatar',
      'm-placeholder-block--small': size === 'small',
      'm-placeholder-block--large': size === 'large',
      'm-placeholder-block--w-small': width === 'small',
      'm-placeholder-block--w-large': width === 'large',
      'm-placeholder-block--w-xlarge': width === 'xlarge',
      'm-placeholder-block--inline-block': display === 'inline-block',
    };

    return (
      <div
        className={classnames(className, 'm-placeholder-block', modifiers)}
        {...props}
      />
    );
  }
}

export default PlaceholderBlock;
