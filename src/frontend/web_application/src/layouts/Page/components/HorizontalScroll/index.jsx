import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import throttle from 'lodash.throttle';
import { Icon, Button } from '../../../../components';
import { addEventListener } from '../../../../services/event-manager';
import { NavbarItem } from '../Navbar/components';
import './style.scss';

const STEP_SIZE = 200;
const SIZE_UNIT = 'px';
const VELOCITY_RIGHT = -1;
const VELOCITY_LEFT = 1;

class HorizontalScroll extends Component {
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
    subscribedState: PropTypes.oneOfType([PropTypes.shape({}), PropTypes.array])
      .isRequired,
  };

  static defaultProps = {
    className: undefined,
  };

  state = {
    hasNavigationSliders: false,
  };

  UNSAFE_componentWillMount() {
    this.container = null;
    this.visibleZone = null;
  }

  componentDidMount() {
    let containerWidth;
    let visibleZoneWidth;
    this.handleZoneSizesChange = throttle(
      () => {
        if (
          containerWidth !== this.container.clientWidth ||
          visibleZoneWidth !== this.visibleZone.clientWidth
        ) {
          containerWidth = this.container.clientWidth;
          visibleZoneWidth = this.visibleZone.clientWidth;
          this.displayNavigationsliders({ containerWidth, visibleZoneWidth });
        }
      },
      1000,
      { leading: true, trailing: true }
    );

    this.unsubscribeResizeEvent = addEventListener(
      'resize',
      this.handleZoneSizesChange
    );
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.subscribedState !== nextProps.subscribedState ||
      this.state.hasNavigationSliders !== nextState.hasNavigationSliders
    );
  }

  componentDidUpdate() {
    this.handleZoneSizesChange();
  }

  componentWillUnmount() {
    this.unsubscribeResizeEvent();
  }

  setRef = (name) => (element) => {
    this[name] = element;
  };

  getDistance = (velocity) => {
    const remain =
      velocity === VELOCITY_RIGHT
        ? this.container.clientWidth +
          this.container.offsetLeft -
          this.visibleZone.clientWidth
        : -1 * this.container.offsetLeft;

    return velocity * Math.min(STEP_SIZE, Math.max(remain, 0));
  };

  displayNavigationsliders = ({ containerWidth, visibleZoneWidth }) => {
    const hasNavigationSliders = containerWidth > visibleZoneWidth;

    if (hasNavigationSliders !== this.state.hasNavigationSliders) {
      this.setState({ hasNavigationSliders }, () => {
        if (!hasNavigationSliders) {
          this.resetContainerPosition();
        }
      });
    }
  };

  resetContainerPosition = () => {
    this.container.style.left = 0;
  };

  moveContainer = (velocity) => {
    const distance = this.getDistance(velocity);
    if (distance) {
      this.container.style.left = `${
        this.container.offsetLeft + distance
      }${SIZE_UNIT}`;
    }
  };

  handleLeftTrigger = () => {
    this.moveContainer(VELOCITY_LEFT);
  };

  handleRightTrigger = () => {
    this.moveContainer(VELOCITY_RIGHT);
  };

  render() {
    const { className, children } = this.props;

    return (
      <div className={classnames(className, 'm-horizontal-scroll')}>
        <div
          className="m-horizontal-scroll__visible-zone"
          ref={this.setRef('visibleZone')}
        >
          <div
            className="m-menu m-horizontal-scroll__container"
            ref={this.setRef('container')}
          >
            {children}
          </div>
        </div>
        {this.state.hasNavigationSliders && (
          <Fragment>
            <NavbarItem className="scroll-anchor-item">
              <Button
                onClick={this.handleLeftTrigger}
                className="m-horizontal-scroll__anchor scroll-anchor--left"
              >
                <Icon type="arrow-left" />
              </Button>
            </NavbarItem>
            <NavbarItem className="scroll-anchor-item">
              <Button
                onClick={this.handleRightTrigger}
                className="m-horizontal-scroll__anchor scroll-anchor--right"
              >
                <Icon type="arrow-right" />
              </Button>
            </NavbarItem>
          </Fragment>
        )}
      </div>
    );
  }
}

export default HorizontalScroll;
