import React from 'react';
import PropTypes from 'prop-types';
import TourPortalBase from 'reactour/dist/TourPortal';
import { TopMask, RightMask, BottomMask, LeftMask, ElementMask, Navigation, Dot } from 'reactour/dist/components';
import cn from 'classnames';
import Guide from '../Guide';
import { Button } from '../../../../../../components/';
import './style.scss';

const CN = {
  mask: {
    base: 'm-tour__mask',
    isOpen: 'm-tour__mask--is-open',
  },
  helper: {
    base: 'm-tour-portal',
    isOpen: 'm-tour-portal--is-open',
  },
};

class TourPortal extends TourPortalBase {
  static propTypes = {
    badgeContent: PropTypes.func,
    highlightedMaskClassName: PropTypes.string,
    className: PropTypes.string,
    closeWithMask: PropTypes.bool,
    inViewThreshold: PropTypes.number,
    isOpen: PropTypes.bool.isRequired,
    lastStepNextButton: PropTypes.string,
    maskClassName: PropTypes.string,
    maskSpace: PropTypes.number,
    nextButton: PropTypes.string,
    onAfterOpen: PropTypes.func,
    onBeforeClose: PropTypes.func,
    onRequestClose: PropTypes.func,
    prevButton: PropTypes.string,
    scrollDuration: PropTypes.number,
    scrollOffset: PropTypes.number,
    showButtons: PropTypes.bool,
    showNavigation: PropTypes.bool,
    showNavigationNumber: PropTypes.bool,
    showNumber: PropTypes.bool,
    startAt: PropTypes.number,
    steps: PropTypes.arrayOf(PropTypes.shape({
      selector: PropTypes.string.isRequired,
      content: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.element,
        PropTypes.func,
      ]).isRequired,
      position: PropTypes.oneOf(['top', 'right', 'bottom', 'left', 'center']),
      action: PropTypes.func,
      style: PropTypes.object,
    })),
    update: PropTypes.string,
    updateDelay: PropTypes.number,
    disableInteraction: PropTypes.bool,
  }

  render() {
    const {
      className,
      steps,
      maskClassName,
      showButtons,
      showNavigation,
      showNavigationNumber,
      showNumber,
      onRequestClose,
      maskSpace,
      lastStepNextButton,
      nextButton,
      prevButton,
      closeButton,
      skipButton,
      badgeContent,
      highlightedMaskClassName,
      disableInteraction,
    } = this.props;

    const {
      isOpen,
      current,
      inDOM,
      top: targetTop,
      right: targetRight,
      bottom: targetBottom,
      left: targetLeft,
      width: targetWidth,
      height: targetHeight,
      w: windowWidth,
      h: windowHeight,
      helperWidth,
      helperHeight,
      helperPosition,
    } = this.state;

    if (isOpen) {
      return (
        <div>
          <div
            role="button"
            tabIndex={-1}
            ref={(c) => { this.mask = c; }}
            onClick={this.maskClickHandler}
            onKeyPress={this.maskClickHandler}
            className={cn(CN.mask.base, {
              [CN.mask.isOpen]: isOpen,
            })}
          >
            <TopMask
              targetTop={targetTop}
              padding={maskSpace}
              className={maskClassName}
            />
            <RightMask
              targetTop={targetTop}
              targetLeft={targetLeft}
              targetWidth={targetWidth}
              targetHeight={targetHeight}
              windowWidth={windowWidth}
              padding={maskSpace}
              className={maskClassName}
            />
            <BottomMask
              targetHeight={targetHeight}
              targetTop={targetTop}
              windowHeight={windowHeight}
              padding={maskSpace}
              className={maskClassName}
            />
            <LeftMask
              targetHeight={targetHeight}
              targetTop={targetTop}
              targetLeft={targetLeft}
              padding={maskSpace}
              className={maskClassName}
            />
          </div>
          {disableInteraction && (
            <ElementMask
              targetTop={targetTop}
              targetLeft={targetLeft}
              targetWidth={targetWidth}
              targetHeight={targetHeight}
              padding={maskSpace}
              className={highlightedMaskClassName}
            />
          )}
          <Guide
            innerRef={(c) => { this.helper = c; }}
            targetHeight={targetHeight}
            targetWidth={targetWidth}
            targetTop={targetTop}
            targetRight={targetRight}
            targetBottom={targetBottom}
            targetLeft={targetLeft}
            windowWidth={windowWidth}
            windowHeight={windowHeight}
            helperWidth={helperWidth}
            helperHeight={helperHeight}
            helperPosition={helperPosition}
            padding={maskSpace}
            tabIndex={-1}
            current={current}
            style={steps[current].style ? steps[current].style : {}}
            className={cn(CN.helper.base, className, {
              [CN.helper.isOpen]: isOpen,
            })}
          >
            {showNumber && (
              <div className="m-tour-portal__badge">
                {typeof badgeContent === 'function' ? (
                  badgeContent(current + 1, steps.length)
                ) : (
                  current + 1
                )}
              </div>
            )}
            <div className="m-tour-portal__close">
              <Button onClick={onRequestClose} icon="remove"><span className="show-for-sr">{closeButton}</span></Button>
            </div>
            <div className="m-tour-portal__content">
              {steps[current] &&
                (typeof steps[current].content === 'function'
                  ? steps[current].content({
                    goTo: this.gotoStep,
                    inDOM,
                    step: current + 1,
                  })
                  : steps[current].content)}
            </div>
            <div className="m-tour-portal__controls">
              {showButtons && (current !== 0 || !skipButton) && (
                <Button
                  onClick={this.prevStep}
                  disabled={current === 0}
                >
                  {prevButton}
                </Button>
              )}
              {showButtons && current === 0 && (
                <Button onClick={onRequestClose}>{skipButton}</Button>
              )}

              {showNavigation && (
                <Navigation>
                  {steps.map((s, i) => (
                    <Dot
                      key={`${s.selector}_${i}`}
                      onClick={() => this.gotoStep(i)}
                      current={current}
                      index={i}
                      disabled={current === i}
                      showNumber={showNavigationNumber}
                    />
                  ))}
                </Navigation>
              )}

              {showButtons && (
                <Button
                  onClick={() => {
                    if (current !== steps.length - 1) {
                      return this.nextStep();
                    }

                    if (lastStepNextButton) {
                      return onRequestClose();
                    }

                    return null;
                  }}
                  disabled={!lastStepNextButton && current === steps.length - 1}
                  shape={(current !== (steps.length - 1)) ? 'plain' : null}
                >
                  {current === steps.length - 1 ? lastStepNextButton : nextButton}
                </Button>
              )}
            </div>
          </Guide>
        </div>
      );
    }

    return (<div />);
  }
}

export default TourPortal;
