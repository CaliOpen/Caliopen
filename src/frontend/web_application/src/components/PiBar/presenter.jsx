import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Icon from '../Icon';
import './style.scss';

const PiBar = ({ level, className }) => {
  const classNameModifiers = {
    disabled: 'm-pi-bar--disabled',
    ugly: 'm-pi-bar--ugly',
    bad: 'm-pi-bar--bad',
    good: 'm-pi-bar--good',
    super: 'm-pi-bar--super',
  };
  const disabledLevel = 50;

  let key;
  switch (true) {
    default:
    case !level && level !== 0:
      key = 'disabled';
      break;
    case level <= 20:
      key = 'ugly';
      break;
    case level > 20 && level <= 50:
      key = 'bad';
      break;
    case level > 50 && level <= 80:
      key = 'good';
      break;
    case level > 80:
      key = 'super';
      break;
  }

  const barStyle = {
    width: `${!level && level !== 0 ? disabledLevel : level}%`,
  };

  const piBarClassName = classnames(
    'm-pi-bar',
    classNameModifiers[key],
    className
  );

  return (
    <div className={piBarClassName}>
      <div className="m-pi-bar__graph">
        <Icon type="shield" className="m-pi-bar__icon" />
        <div className="m-pi-bar__guide">
          <div className="m-pi-bar__bar" style={barStyle} />
        </div>
        <div className="m-pi-bar__level">{level}</div>
      </div>
    </div>
  );
};

PiBar.propTypes = {
  level: PropTypes.number,
  className: PropTypes.string,
};
PiBar.defaultProps = {
  level: undefined,
  className: undefined,
};

export default PiBar;
