/* eslint-disable no-unneeded-ternary, no-nested-ternary */
import React from 'react';
// extends https://github.com/elrumordelaluz/reactour/blob/master/src/TourPortal.js
import TourPortalBase from 'reactour/dist/TourPortal';
import { Trans } from '@lingui/react';
import { Navigation, Dot, SvgMask, Controls } from 'reactour/dist/components';
import cn from 'classnames';
import Guide from '../Guide';
import { Button } from '../../../../../../components';
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
  render() {
    const {
      className,
      steps,
      maskClassName,
      showButtons,
      showCloseButton,
      showNavigation,
      showNavigationNumber,
      showNumber,
      onRequestClose,
      maskSpace,
      lastStepNextButton,
      nextButton,
      prevButton,
      badgeContent,
      highlightedMaskClassName,
      disableInteraction,
      disableDotsNavigation,
      nextStep,
      prevStep,
      rounded,
      accentColor,
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
            ref={(c) => {
              this.mask = c;
            }}
            onClick={this.maskClickHandler}
            onKeyPress={this.maskClickHandler}
            className={cn(CN.mask.base, {
              [CN.mask.isOpen]: isOpen,
            })}
          >
            <SvgMask
              windowWidth={windowWidth}
              windowHeight={windowHeight}
              targetWidth={targetWidth}
              targetHeight={targetHeight}
              targetTop={targetTop}
              targetLeft={targetLeft}
              padding={maskSpace}
              rounded={rounded}
              className={maskClassName}
              disableInteraction={
                disableInteraction && steps[current].stepInteraction
                  ? !steps[current].stepInteraction
                  : disableInteraction
              }
              disableInteractionClassName={`${CN.mask.disableInteraction} ${highlightedMaskClassName}`}
            />
          </div>
          <Guide
            ref={this.helper}
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
            rounded={rounded}
            className={cn(CN.helper.base, className, {
              [CN.helper.isOpen]: isOpen,
            })}
            accentColor={accentColor}
          >
            {showNumber && (
              // overide Badge with className
              <div className="m-tour-portal__badge">
                {typeof badgeContent === 'function'
                  ? badgeContent(current + 1, steps.length)
                  : current + 1}
              </div>
            )}
            {/* append close section */}
            {showCloseButton && (
              <div className="m-tour-portal__close">
                <Button onClick={onRequestClose} icon="remove">
                  <span className="show-for-sr">
                    <Trans id="take-a-tour.action.close" message="Close" />
                  </span>
                </Button>
              </div>
            )}
            {/* add className */}
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
              {(showButtons || showNavigation) && (
                <Controls data-tour-elem="controls">
                  {showButtons && (
                    // replace SvgArrow components by simple Buttons
                    <Button
                      onClick={
                        typeof prevStep === 'function'
                          ? prevStep
                          : this.prevStep
                      }
                      disabled={current === 0}
                    >
                      {prevButton}
                    </Button>
                  )}

                  {showNavigation && (
                    <Navigation data-tour-elem="navigation">
                      {steps.map((s, i) => (
                        <Dot
                          key={`${s.selector ? s.selector : 'undef'}_${i}`}
                          onClick={() => this.gotoStep(i)}
                          current={current}
                          index={i}
                          disabled={current === i || disableDotsNavigation}
                          showNumber={showNavigationNumber}
                          data-tour-elem="dot"
                        />
                      ))}
                    </Navigation>
                  )}

                  {showButtons && (
                    <Button
                      onClick={
                        current === steps.length - 1
                          ? lastStepNextButton
                            ? onRequestClose
                            : () => {
                                // noop
                              }
                          : typeof nextStep === 'function'
                          ? nextStep
                          : this.nextStep
                      }
                      disabled={
                        !lastStepNextButton && current === steps.length - 1
                      }
                    >
                      {lastStepNextButton && current === steps.length - 1
                        ? lastStepNextButton
                        : nextButton
                        ? nextButton
                        : null}
                    </Button>
                  )}
                </Controls>
              )}
            </div>
          </Guide>
          {this.props.children}
        </div>
      );
    }

    return <div />;
  }
}

export default TourPortal;
