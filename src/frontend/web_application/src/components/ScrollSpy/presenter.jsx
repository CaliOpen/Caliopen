import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import { getTop, scrollTop, getViewPortTop } from '../../services/scroll';
import { addEventListener } from '../../services/event-manager';

class ScrollSpy extends Component {
  static propTypes = {
    className: PropTypes.string,
    location: PropTypes.shape({}),
    children: PropTypes.node,
    replaceLocation: PropTypes.func.isRequired,
  };
  static defaultProps = {
    location: undefined,
    className: undefined,
    children: null,
  };

  static childContextTypes = {
    scrollSpySubscribe: PropTypes.func.isRequired,
    scrollToHash: PropTypes.func.isRequired,
  };

  state = {
    subscriptions: [],
  };

  getChildContext() {
    return {
      scrollSpySubscribe: (ref) => {
        this.setState(prevState => ({ subscriptions: [...prevState.subscriptions, ref] }));

        return () => this.setState(prevState => ({
          subscriptions: prevState.subscriptions.filter(subscription => subscription !== ref),
        }));
      },
      scrollToHash: (hash) => {
        const domNode = this.state.subscriptions.find(ref => ref.id === hash);
        scrollTop(getViewPortTop(domNode), true);
      },
    };
  }

  componentDidMount() {
    this.unsubscribeScrollEvent = addEventListener('scroll', debounce(() => {
      const { location } = this.props;
      if (!location) {
        return;
      }
      const domNode = this.getNearestElementFromTop(this.state.subscriptions);

      if (domNode && location.hash.replace('#', '') !== domNode.id) {
        this.props.replaceLocation({ ...location, hash: `#${domNode.id}` });
      }
    }, 100, { leading: false, trailing: true }));
  }

  componentWillUnmount() {
    if (this.unsubscribeScrollEvent) {
      this.unsubscribeScrollEvent();
    }
  }

  getNearestElementFromTop = subscriptions => subscriptions.reduce((acc, target) => {
    if (getTop(target) < 0) {
      return acc;
    }

    if (!acc || getTop(acc) > getTop(target)) {
      return target;
    }

    return acc;
  }, undefined);

  render() {
    const { className } = this.props;

    return (
      <div className={className}>{this.props.children}</div>
    );
  }
}

export default ScrollSpy;
