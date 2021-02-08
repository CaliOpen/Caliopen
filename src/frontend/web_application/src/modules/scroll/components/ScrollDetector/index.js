import { Component } from 'react';
import PropTypes from 'prop-types';
import throttle from 'lodash.throttle';
import { addEventListener } from '../../../../services/event-manager';

class ScrollDetector extends Component {
  static propTypes = {
    render: PropTypes.func.isRequired,
    offset: PropTypes.number,
  };

  static defaultProps = {
    offset: 0,
  };

  state = {
    isScrollDetected: false,
  };

  componentDidMount() {
    this.scrollDetection();
    this.unsubscribeScrollEvent = addEventListener(
      'scroll',
      throttle(
        () => {
          this.scrollDetection();
        },
        10,
        { leading: true, trailing: true }
      )
    );
  }

  componentWillUnmount() {
    this.unsubscribeScrollEvent();
  }

  scrollDetection = () => {
    const { offset } = this.props;
    const scrollSize = window.scrollY || document.documentElement.scrollTop;
    const isScrollDetected = scrollSize > offset;

    if (this.state.isScrollDetected !== isScrollDetected) {
      this.setState({ isScrollDetected });
    }
  };

  render() {
    const { render } = this.props;

    return render(this.state.isScrollDetected);
  }
}

export default ScrollDetector;
