import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import { withRouter } from 'react-router-dom';
import { withCurrentTab, withUpdateTab, Tab } from '../../tab';
import { addEventListener } from '../../../services/event-manager';

const SCROLL_DEBOUNCE_WAIT = 700;

// XXX: may be scrollRestauration will be usefull https://reacttraining.com/react-router/web/guides/scroll-restoration
export const withScrollManager = ({ namespace = 'scrollManager' } = {}) => (
  Comp
) => {
  @withUpdateTab()
  @withCurrentTab()
  @withRouter
  class ScrollManager extends Component {
    static propTypes = {
      updateTab: PropTypes.func.isRequired,
      currentTab: PropTypes.shape({ scrollY: PropTypes.number }),
      location: PropTypes.shape({
        hash: PropTypes.string.isRequired,
        key: PropTypes.string.isRequired,
      }).isRequired,
    };

    static defaultProps = {
      currentTab: undefined,
    };

    state = { alreadyScrolledContext: '' };

    componentDidMount() {
      this.unmounted = false;
      this.unsubscribeScrollEvent = addEventListener(
        'scroll',
        debounce(this.saveScrollPosition, SCROLL_DEBOUNCE_WAIT, {
          trailing: true,
        })
      );

      this.scroll();
    }

    componentDidUpdate() {
      this.scroll();
    }

    componentWillUnmount() {
      if (this.unsubscribeScrollEvent) this.unsubscribeScrollEvent();
      this.unmounted = true;
    }

    saveScrollPosition = () => {
      if (this.unmounted === true) return;

      const { currentTab, updateTab: setTabScroll } = this.props;
      const { scrollY: newScrollY } = window;
      const tab = new Tab({ ...currentTab, scrollY: newScrollY });

      setTabScroll({ tab, original: currentTab });
    };

    scroll = () => {
      if (!this.props.currentTab) return;

      const {
        currentTab: { scrollY },
        location,
      } = this.props;
      const hash =
        location.hash && location.hash.length > 1 ? location.hash.slice(1) : '';

      if (
        (!hash || hash === '') &&
        !Number.isNaN(scrollY) &&
        this.state.alreadyScrolledContext !== this.props.location.key
      ) {
        this.restoreScroll(scrollY);
        this.saveScrollPosition();
      }
    };

    restoreScroll = (scrollY) => {
      window.scrollTo(0, scrollY);
      this.setState({ alreadyScrolledContext: this.props.location.key });
    };

    shouldScrollToTarget = () => this.props.location.key;

    render() {
      const injected = {
        [namespace]: {
          scrollToTarget: this.shouldScrollToTarget,
        },
      };

      return <Comp {...injected} {...this.props} />;
    }
  }

  return ScrollManager;
};
