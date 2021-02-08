import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Link as BaseLink } from 'react-router-dom';
import classnames from 'classnames';
import './style.scss';

class Link extends PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    href: PropTypes.string,
    target: PropTypes.string,
    noDecoration: PropTypes.bool,
    className: PropTypes.string,
    button: PropTypes.bool,
    badge: PropTypes.bool,
    expanded: PropTypes.bool,
    plain: PropTypes.bool,
    active: PropTypes.bool,
  };

  static defaultProps = {
    href: undefined,
    target: undefined,
    noDecoration: false,
    className: undefined,
    button: false,
    badge: false,
    expanded: false,
    active: false,
    plain: false,
  };

  render() {
    const {
      children,
      href,
      noDecoration,
      className,
      button,
      badge,
      expanded,
      active,
      plain,
      target,
      ...props
    } = this.props;

    const linkProps = {
      ...props,
      target,
      // https://mathiasbynens.github.io/rel-noopener/
      rel: target && 'noopener noreferrer',
      className: classnames(className, 'm-link', {
        'm-link--button': button,
        'm-link--badge': badge,
        'm-link--plain': plain,
        'm-link--expanded': expanded,
        'm-link--text': !button && !noDecoration,
        'm-link--active': active,
      }),
    };

    if (href) {
      return (
        <a href={href} {...linkProps}>
          {children}
        </a>
      );
    }

    return <BaseLink {...linkProps}>{children}</BaseLink>;
  }
}

export default Link;
