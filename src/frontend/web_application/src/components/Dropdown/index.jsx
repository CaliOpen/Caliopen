import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import Presenter, { Raw } from './presenter';
import Button, { RawButton } from '../Button';
import './style.scss';

export const DropdownController = ({ className, toggle, raw, alignement, ...props }) => {
  const dropdownProps = {
    ...props,
    className: classnames(className, {
      'dropdown-float-right': alignement === 'right',
    }),
    'data-toggle': toggle,
  };

  if (raw) {
    return <RawButton {...dropdownProps} />;
  }

  return <Button {...dropdownProps} />;
};

DropdownController.propTypes = {
  className: PropTypes.string,
  toggle: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  raw: PropTypes.bool,
  alignement: PropTypes.oneOf(['right']),
};

class Dropdown extends Component {
  componentDidMount() {
    const $dropdown = jQuery(`#${this.props.id}`);
    // eslint-disable-next-line no-new
    new Foundation.Dropdown($dropdown, {
      hOffset: 0,
    });
    // `positionClass` option (eg. 'right bottom') is always overriden
    // use css classes instead (cf. alignement and position)
    // see https://github.com/zurb/foundation-sites/pull/9019

    if (this.onToggle) {
      $dropdown.on('show.zf.dropdown', () => {
        this.onToggle(true);
      });
      $dropdown.on('hide.zf.dropdown', () => {
        this.onToggle(false);
      });
    }
  }

  render() {
    const { id, closeOnClick, className, raw, position, onToggle, ...props } = this.props;
    this.onToggle = onToggle;

    const dropdownProps = {
      ...props,
      id,
      'data-close-on-click': closeOnClick,
      className: classnames(className, position),
    };

    if (raw) {
      return <Raw {...dropdownProps} />;
    }

    return <Presenter {...dropdownProps} />;
  }
}

Dropdown.propTypes = {
  id: PropTypes.string.isRequired,
  className: PropTypes.string,
  position: PropTypes.oneOf(['bottom']),
  closeOnClick: PropTypes.bool,
  raw: PropTypes.bool,
  onToggle: PropTypes.func,
};

export default Dropdown;
