import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { scrollTop, getViewPortTop } from '../../services/scroll';

class ScrollToWhenHash extends PureComponent {
  static propTypes = {
    hash: PropTypes.string,
    id: PropTypes.string,
    children: PropTypes.node,
    className: PropTypes.string,
    forceTop: PropTypes.bool,
  };
  static defaultProps = {
    className: undefined,
    children: null,
    hash: undefined,
    id: undefined,
    forceTop: false,
  };

  static contextTypes = {
    scrollSpySubscribe: PropTypes.func,
  };

  componentDidMount() {
    const { id, hash, forceTop } = this.props;

    if (!forceTop && hash && id === hash.replace('#', '')) {
      const top = getViewPortTop(this.scrollDiv);
      scrollTop(top);
    }

    if (forceTop) {
      scrollTop(0);
    }

    if (this.context.scrollSpySubscribe) {
      this.unsubscribeScrollSpy = this.context.scrollSpySubscribe(this.scrollDiv);
    }
  }

  componentWillUnmount() {
    if (this.unsubscribeScrollSpy) {
      this.unsubscribeScrollSpy();
    }
  }

  render() {
    const { className, id } = this.props;

    return (
      <div className={className} ref={(div) => { this.scrollDiv = div; }} id={id}>
        {this.props.children}
      </div>
    );
  }
}

export default ScrollToWhenHash;
