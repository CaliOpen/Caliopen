import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { scrollTop } from '../services/scrollTop';
import { getViewPortTop } from '../services/getViewPortTop';

export const withScrollTarget = ({ namespace = 'scrollTarget' } = {}) => (
  Component
) => {
  class ScrollTarget extends PureComponent {
    static propTypes = {
      scrollToMe: PropTypes.func,
    };

    static defaultProps = {
      scrollToMe: undefined,
    };

    state = { alreadyScrolledContext: undefined };

    componentDidMount = () => this.scroll();

    componentDidUpdate = () => this.scroll();

    getRef = (ref) => {
      this.element = ref;
    };

    scroll = () => {
      if (!this.props.scrollToMe || !this.element) return;

      const scrollContext = this.props.scrollToMe();

      if (this.state.alreadyScrolledContext !== scrollContext) {
        const top = getViewPortTop(this.element);
        scrollTop(top);

        this.setState({ alreadyScrolledContext: scrollContext });
      }
    };

    render() {
      const injected = {
        [namespace]: {
          forwardRef: this.getRef,
        },
      };

      return <Component {...injected} {...this.props} />;
    }
  }

  return ScrollTarget;
};
