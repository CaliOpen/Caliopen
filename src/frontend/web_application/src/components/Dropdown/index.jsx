import React, { Component, forwardRef, createRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import throttle from 'lodash.throttle';
import { getDropdownStyle } from './services/getDropdownStyle';
import { addEventListener } from '../../services/event-manager';
import './style.scss';

export const CONTROL_PREFIX = 'toggle';
const CLOSE_ON_CLICK_ALL = 'all';
const CLOSE_ON_CLICK_EXCEPT_SELF = 'exceptSelf';
const DO_NOT_CLOSE = 'doNotClose';

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

  return forwardRef(WithDropdownControl);
};

class Dropdown extends Component {
  static propTypes = {
    id: PropTypes.string,
    alignRight: PropTypes.bool, // force align right
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    className: PropTypes.string,
    closeOnClick: PropTypes.oneOf([
      CLOSE_ON_CLICK_ALL,
      CLOSE_ON_CLICK_EXCEPT_SELF,
      DO_NOT_CLOSE,
    ]),
    closeOnScroll: PropTypes.bool, // should Dropdown close on windows scroll ?
    isMenu: PropTypes.bool,
    onToggle: PropTypes.func,
    innerRef: PropTypes.shape({ current: PropTypes.shape({}) }),
    dropdownControlRef: PropTypes.shape({
      current: PropTypes.shape({
        contains: PropTypes.func,
      }),
    }),
    show: PropTypes.bool,
    displayFirstLayer: PropTypes.bool,
  };

  static defaultProps = {
    id: undefined,
    alignRight: false,
    children: null,
    className: null,
    closeOnClick: CLOSE_ON_CLICK_EXCEPT_SELF,
    closeOnScroll: false,
    isMenu: false,
    onToggle: (str) => str,
    show: false,
    innerRef: undefined,
    dropdownControlRef: undefined,
    displayFirstLayer: false,
  };

  static defaultDropdownStyle = {
    // force postion in order to have the correct width when calc position
    top: 0,
    left: 0,
  };

  constructor(props) {
    super(props);
    this.dropdownRef = props.innerRef || createRef();
  }

  state = {
    isOpen: false,
    dropdownStyle: this.constructor.defaultDropdownStyle,
  };

  componentDidMount() {
    const { dropdownControlRef, show } = this.props;
    this.handleToggleVisibility({ show });

    if (this.props.closeOnClick !== DO_NOT_CLOSE) {
      this.unsubscribeClickEvent = addEventListener('click', (ev) => {
        const { target } = ev;

        const dropdownClick =
          this.dropdownRef.current === target ||
          this.dropdownRef.current.contains(target);
        const controlClick =
          dropdownControlRef &&
          (dropdownControlRef.current === target ||
            dropdownControlRef.current.contains(target));

        if (controlClick) {
          this.handleToggleVisibility({ show: !this.state.isOpen });

          return;
        }

        if (
          this.props.closeOnClick === CLOSE_ON_CLICK_EXCEPT_SELF &&
          dropdownClick
        ) {
          return;
        }

        this.handleToggleVisibility({ show: false });
      });
    }

    this.unsubscribeResizeEvent = addEventListener('resize', () => {
      // this prevent dropdown to be misplaced on window resize
      // TODO: get new offset instead of closing dropdown
      this.handleToggleVisibility({ show: false });
    });

    this.unsubscribeScrollEvent = this.props.closeOnScroll
      ? addEventListener(
          'scroll',
          throttle(
            () => {
              const scrollSize = window.scrollY;
              const closeDropdown = scrollSize > 10;

              if (closeDropdown) {
                this.handleToggleVisibility({ show: false });
              }
            },
            100,
            { leading: true, trailing: true }
          )
        )
      : () => {
          // noop
        };
  }

  componentDidUpdate(prevProps) {
    const { show } = this.props;

    if (show !== prevProps.show) {
      this.handleToggleVisibility({ show });
    }
  }

  componentWillUnmount() {
    if (this.unsubscribeClickEvent) {
      this.unsubscribeClickEvent();
    }
    this.unsubscribeResizeEvent();
    this.unsubscribeScrollEvent();
  }

  getStyles = ({ show }) => {
    if (!show) {
      // dropdown must be at default position when not visible for correct calc when displaying it
      return this.constructor.defaultDropdownStyle;
    }

    const { alignRight, dropdownControlRef } = this.props;

    // FIXME: when no dropdownControl declared, it should calc position according to ??? position
    // may be a relativeRef which is optionnal?
    // relativeRef = relativeRef || dropdownControlRef;
    return dropdownControlRef
      ? getDropdownStyle({
          alignRight,
          controlElement: dropdownControlRef.current,
          dropdownElement: this.dropdownRef.current,
        })
      : this.constructor.defaultDropdownStyle;
  };

  handleToggleVisibility = ({ show }) => {
    if (show === this.state.isOpen) {
      return;
    }
    this.setState(
      {
        dropdownStyle: this.getStyles({ show }),
        isOpen: show,
      },
      () => {
        this.props.onToggle(this.state.isOpen);
      }
    );
  };

  render() {
    const { id, className, children, isMenu, displayFirstLayer } = this.props;

    const dropdownProps = {
      id,
      className: classnames(
        'm-dropdown',
        { 'm-dropdown--is-open': this.state.isOpen },
        { 'm-dropdown--is-menu': isMenu },
        { 'm-dropdown--display-first-layer': displayFirstLayer },
        className
      ),
      tabIndex: 0,
      role: 'presentation',
      style: this.state.dropdownStyle,
    };

    return (
      <div ref={this.dropdownRef} {...dropdownProps}>
        {children}
      </div>
    );
  }
}

export default forwardRef((props, ref) => (
  <Dropdown {...props} innerRef={ref} />
));
