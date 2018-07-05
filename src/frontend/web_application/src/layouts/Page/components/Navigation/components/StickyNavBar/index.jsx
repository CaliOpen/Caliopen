import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import throttle from 'lodash.throttle';
import { addEventListener } from '../../../../../../services/event-manager';

class StickyNavbarClass extends Component {
  static propTypes = {
    className: PropTypes.string,
    stickyClassName: PropTypes.string,
  }

  static defaultProps = {
    className: undefined,
    stickyClassName: undefined,
  }

  constructor(props) {
    super(props);
    this.state = {
      isSticky: false,
    };
  }

  componentDidMount() {
    this.unsubscribeScrollEvent = addEventListener('scroll', throttle(() => {
      const scrollSize = window.scrollY || document.documentElement.scrollTop;
      const isSticky = scrollSize > 176; // 96px = 6rem = .l-navigation__wrapper margin-top

      if (this.state.isSticky !== isSticky) {
        this.setState({ isSticky });
      }
    }, 10, { leading: true, trailing: true }));
  }

  componentWillUnmount() {
    this.unsubscribeScrollEvent();
  }

  render() {
    const { className: initialClassName, stickyClassName, ...props } = this.props;
    const className = classnames(initialClassName, { [stickyClassName]: this.state.isSticky });

    return <div className={className} {...props} />;
  }
}

export default StickyNavbarClass;
