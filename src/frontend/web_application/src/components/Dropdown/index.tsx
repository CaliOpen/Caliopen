import * as React from 'react';
import classnames from 'classnames';
import throttle from 'lodash/throttle';
import { useForwardedRef } from 'src/hooks/forwardedRef';
import { getDropdownStyle } from './services/getDropdownStyle';
import { addEventListener } from '../../services/event-manager';
import './style.scss';

export const CONTROL_PREFIX = 'toggle';
const CLOSE_ON_CLICK_ALL = 'all';
const CLOSE_ON_CLICK_EXCEPT_SELF = 'exceptSelf';
const DO_NOT_CLOSE = 'doNotClose';

type CloseOn =
  | typeof CLOSE_ON_CLICK_ALL
  | typeof CLOSE_ON_CLICK_EXCEPT_SELF
  | typeof DO_NOT_CLOSE;

export const withDropdownControl = (WrappedComponent) => {
  const WithDropdownControl = (props, ref) => {
    if (!ref) {
      throw new Error(
        `a ref is mandatory for a dropdown controller created with "${
          WrappedComponent.displayName || WrappedComponent.name || 'Component'
        }"`
      );
    }

    return <WrappedComponent role="button" tabIndex="0" ref={ref} {...props} />;
  };

  // does this work since it is a forwarded component
  WithDropdownControl.displayName = `WithDropdownControl(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return React.forwardRef(WithDropdownControl);
};

interface DropdownProps {
  id: string;
  alignRight?: boolean; // force align right
  children: React.ReactNode;
  className?: string;
  closeOnClick?: CloseOn;
  closeOnScroll?: boolean; // should Dropdown close on windows scroll ?
  isMenu?: boolean;
  /** even if controlled (`doNotClose`), some behaviors (resize) can autoclose dropdown, so `onToggle` must be handled */
  onToggle?: (visibility: boolean) => void;
  show?: boolean;
  displayFirstLayer?: boolean;
  innerRef: React.ForwardedRef<HTMLDivElement>;
  dropdownControlRef: React.MutableRefObject<HTMLElement | null>;
}
const defaultDropdownStyle: React.CSSProperties = {
  // force postion in order to have the correct width when calc position
  top: 0,
  left: 0,
  // XXX: not required but testing-lib does not see attached css (may be take a look to `jest-transform-css`)
  visibility: 'hidden',
};
function Dropdown({
  id,
  alignRight = false,
  children,
  className,
  closeOnClick = CLOSE_ON_CLICK_EXCEPT_SELF,
  closeOnScroll = false,
  isMenu = false,
  onToggle = () => {},
  show = false,
  displayFirstLayer = false,
  innerRef,
  dropdownControlRef,
}: DropdownProps) {
  const dropdownRef = useForwardedRef<HTMLDivElement>(innerRef);

  const [isOpen, setIsOpen] = React.useState(show);

  React.useEffect(() => {
    const unsubscribeResizeEvent = addEventListener('resize', () => {
      // this prevent dropdown to be misplaced on window resize
      // TODO: get new offset instead of closing dropdown
      handleToggleVisibility(false);
    });

    const unsubscribeScrollEvent = closeOnScroll
      ? addEventListener(
          'scroll',
          throttle(
            () => {
              const scrollSize = window.scrollY;
              const closeDropdown = scrollSize > 10;

              if (closeDropdown) {
                handleToggleVisibility(false);
              }
            },
            100,
            { leading: true, trailing: true }
          )
        )
      : () => {
          // noop
        };

    return () => {
      unsubscribeResizeEvent();
      unsubscribeScrollEvent();
    };
  }, []);

  React.useEffect(() => {
    let unsubscribeClickEvent = () => {};

    if (closeOnClick !== DO_NOT_CLOSE) {
      unsubscribeClickEvent = addEventListener(
        'click',
        (ev: React.SyntheticEvent<HTMLElement>) => {
          const { target } = ev;
          let dropdownClick: boolean = false;
          if (
            dropdownRef &&
            typeof dropdownRef !== 'function' &&
            dropdownRef?.current
          ) {
            dropdownClick =
              dropdownRef.current === target ||
              // https://stackoverflow.com/questions/61164018/typescript-ev-target-and-node-contains-eventtarget-is-not-assignable-to-node
              dropdownRef.current?.contains(target as Node);
          }

          const controlClick: boolean =
            dropdownControlRef.current === target ||
            dropdownControlRef.current?.contains(target as Node) ||
            false;

          if (controlClick) {
            handleToggleVisibility(!isOpen);

            return;
          }

          if (
            closeOnClick === CLOSE_ON_CLICK_EXCEPT_SELF &&
            (dropdownClick || controlClick)
          ) {
            return;
          }

          if (isOpen === true) {
            handleToggleVisibility(false);
          }
        }
      );
    }

    return () => {
      unsubscribeClickEvent();
    };
  }, [isOpen, dropdownRef, dropdownControlRef]);

  // React.useEffect(() => {
  //   if (show !== isOpen) {
  //     setIsOpen(show);
  //   }
  // }, [show]);

  const getStyles = (visibility: boolean): React.CSSProperties => {
    if (!visibility) {
      // dropdown must be at default position when not visible for correct calc when displaying it
      return defaultDropdownStyle;
    }

    // FIXME: when no dropdownControl declared, it should calc position according to ??? position
    // may be a relativeRef which is optionnal?
    // relativeRef = relativeRef || dropdownControlRef;
    if (
      dropdownControlRef &&
      typeof dropdownControlRef !== 'function' &&
      dropdownControlRef.current &&
      dropdownRef &&
      typeof dropdownRef !== 'function' &&
      dropdownRef.current
    ) {
      return getDropdownStyle({
        alignRight,
        controlElement: dropdownControlRef.current,
        dropdownElement: dropdownRef.current,
      });
    }

    return defaultDropdownStyle;
  };

  const handleToggleVisibility = (visibility: boolean) => {
    onToggle(visibility);
    if (closeOnClick !== 'doNotClose') {
      setIsOpen(visibility);
    }
  };

  // Since dropdown position is computed according to previous position, the
  // memoization makes sure styles are kept during multiples re-render.
  const dropdownStyle = React.useMemo(() => getStyles(isOpen || show), [
    isOpen,
    show,
  ]);

  const dropdownProps = {
    id,
    className: classnames(
      'm-dropdown',
      { 'm-dropdown--is-open': isOpen || show },
      { 'm-dropdown--is-menu': isMenu },
      { 'm-dropdown--display-first-layer': displayFirstLayer },
      className
    ),
    tabIndex: 0,
    role: 'presentation',
    style: dropdownStyle,
  };

  return (
    <div ref={dropdownRef} {...dropdownProps}>
      {children}
    </div>
  );
}

type ForwardedProps = Omit<DropdownProps, 'innerRef'>;
type Ref = HTMLDivElement;

export default React.forwardRef<Ref, ForwardedProps>((props, ref) => (
  <Dropdown {...props} innerRef={ref} />
));
