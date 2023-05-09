import * as React from 'react';
import classnames from 'classnames';
import throttle from 'lodash/throttle';
import { Icon, Button } from 'src/components';
import { addEventListener } from 'src/services/event-manager';
import { NavbarItem } from '../Navbar/components';
import './style.scss';

const STEP_SIZE = 200;
const SIZE_UNIT = 'px';
const VELOCITY_RIGHT = -1;
const VELOCITY_LEFT = 1;
const VISIBLE_MARGIN = 10; // a margin used after a programatic move

interface Props {
  children: React.ReactNode;
  className?: string;
}
function HorizontalScroll({ children, className }: Props) {
  const container = React.useRef<HTMLDivElement>(null);
  const visibleZone = React.useRef<HTMLDivElement>(null);

  const [navigationSliders, setNavigationSliders] = React.useState(false);

  const getDistance = (velocity: number) => {
    if (!container.current || !visibleZone.current) {
      return undefined;
    }

    const remain =
      velocity === VELOCITY_RIGHT
        ? container.current.clientWidth +
          container.current.offsetLeft -
          visibleZone.current.clientWidth
        : -1 * container.current.offsetLeft;

    return velocity * Math.min(STEP_SIZE, Math.max(remain, 0));
  };

  const resetContainerPosition = () => {
    if (!container.current) {
      return;
    }

    container.current.style.left = `0${SIZE_UNIT}`;
  };

  // Force position 0 if navigation becomes hidden
  React.useEffect(() => {
    if (!navigationSliders) {
      resetContainerPosition();
    }
  }, [navigationSliders]);

  const displayNavigationsliders = ({ containerWidth, visibleZoneWidth }) => {
    const hasSliders = containerWidth > visibleZoneWidth;

    if (hasSliders !== navigationSliders) {
      setNavigationSliders(hasSliders);
    }
  };

  // When the visible container is almost empty but still require navigation
  const moveToTheClosestVisiblePosition = () => {
    if (!navigationSliders) {
      // nothing to do
      return;
    }
    if (!container.current || !visibleZone.current) {
      return;
    }
    if (container.current.offsetLeft > 0) {
      // should not happen
      return;
    }
    const containerWidth = container.current.clientWidth;
    const visibleZoneWidth = visibleZone.current.clientWidth;

    // width - (-1 x offset)
    if (containerWidth + container.current.offsetLeft < visibleZoneWidth / 2) {
      const offset = containerWidth - visibleZoneWidth + VISIBLE_MARGIN;
      container.current.style.left = `-${offset}${SIZE_UNIT}`;
    }
  };

  // configure resize event handler and evetually toggle visibility of navigation
  React.useEffect(() => {
    let containerWidth: number;
    let visibleZoneWidth: number;
    const handleZoneSizesChange = throttle(
      () => {
        if (!container.current || !visibleZone.current) {
          return;
        }
        // FIXME undefined container after saving settings
        if (
          containerWidth !== container.current.clientWidth ||
          visibleZoneWidth !== visibleZone.current.clientWidth
        ) {
          containerWidth = container.current.clientWidth;
          visibleZoneWidth = visibleZone.current.clientWidth;
          displayNavigationsliders({ containerWidth, visibleZoneWidth });
        }
      },
      1000,
      { leading: true, trailing: true }
    );

    handleZoneSizesChange(); // probably useless

    const unsubscribeResizeEvent = addEventListener(
      'resize',
      handleZoneSizesChange
    );

    return unsubscribeResizeEvent;
  }, []);

  // eventually toggle navigation visibility on content change
  React.useEffect(() => {
    if (!container.current || !visibleZone.current) {
      return;
    }
    const containerWidth = container.current.clientWidth;
    const visibleZoneWidth = visibleZone.current.clientWidth;
    displayNavigationsliders({ containerWidth, visibleZoneWidth });
    moveToTheClosestVisiblePosition();
  }, [children]);

  const moveContainer = (velocity: number) => {
    if (!container.current) {
      return;
    }
    const distance = getDistance(velocity);
    if (distance) {
      container.current.style.left = `${
        container.current.offsetLeft + distance
      }${SIZE_UNIT}`;
    }
  };

  const handleLeftTrigger = () => {
    moveContainer(VELOCITY_LEFT);
  };

  const handleRightTrigger = () => {
    moveContainer(VELOCITY_RIGHT);
  };

  return (
    <div className={classnames(className, 'm-horizontal-scroll')}>
      <div className="m-horizontal-scroll__visible-zone" ref={visibleZone}>
        <div className="m-menu m-horizontal-scroll__container" ref={container}>
          {children}
        </div>
      </div>
      {navigationSliders && (
        <>
          <NavbarItem className="scroll-anchor-item">
            <Button
              onClick={handleLeftTrigger}
              className="m-horizontal-scroll__anchor scroll-anchor--left"
            >
              <Icon type="arrow-left" />
            </Button>
          </NavbarItem>
          <NavbarItem className="scroll-anchor-item">
            <Button
              onClick={handleRightTrigger}
              className="m-horizontal-scroll__anchor scroll-anchor--right"
            >
              <Icon type="arrow-right" />
            </Button>
          </NavbarItem>
        </>
      )}
    </div>
  );
}

export default HorizontalScroll;
