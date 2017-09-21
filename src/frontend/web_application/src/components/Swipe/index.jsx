import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tappable from 'react-tappable';
import classnames from 'classnames';

// import './style.scss';

const MIN_X = 30; // min x delta swipe for horizontal swipe
const MAX_Y = 50; // max y delta for horizontal swipe

function getGestureDirection(eventObj) {
  const xDelta = eventObj.startX - eventObj.endX;
  const yDelta = eventObj.startY - eventObj.endY;
  let validGesture = false;
  // first, check if gesture is long enought to trigger event
  validGesture = (Math.abs(xDelta) > MIN_X && Math.abs(yDelta) < MAX_Y) && true;
  // check gesture horizontal direction
  const gestureDirection = xDelta < 0 ? 'right' : 'left';

  return validGesture ? gestureDirection : null;
}

class Swipe extends Component {

  static propTypes = {
    className: PropTypes.string,
    onSwipeLeft: PropTypes.func,
    onSwipeRight: PropTypes.func,
  };

  static defaultProps = {
    className: null,
    onSwipeRight: str => str,
    onSwipeLeft: str => str,
  };

  state = {
    eventObj: {
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
    },
  };

  handleTouchStart = (e) => {
    const touch = e.touches[0];
    this.setState(prevState => ({
      ...prevState,
      eventObj: {
        ...prevState.eventObj,
        startX: touch.screenX,
        startY: touch.screenY,
      },
    }));
  }

  handleTouchMove = (e) => {
    const touch = e.touches[0];
    this.setState(prevState => ({
      ...prevState,
      eventObj: {
        ...prevState.eventObj,
        endX: touch.screenX,
        endY: touch.screenY,
      },
    }));
  }

  handleTouchEnd = () => {
    const { eventObj } = this.state;
    const direction = getGestureDirection(eventObj);

    if (direction === 'left' && this.props.onSwipeLeft()) { return this.props.onSwipeLeft(); }
    if (direction === 'right' && this.props.onSwipeRight()) { return this.props.onSwipeRight(); }

    return false;
  }

  render() {
    const { className, onSwipeRight, onSwipeLeft, ...props } = this.props;

    return (
      <Tappable
        className={classnames('m-swipe', className)}
        {...props}
        onTouchStart={this.handleTouchStart}
        onTouchMove={this.handleTouchMove}
        onTouchEnd={this.handleTouchEnd}
      />
    );
  }
}

export default Swipe;
