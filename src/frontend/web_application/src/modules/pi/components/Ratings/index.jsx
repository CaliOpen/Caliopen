import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { getAveragePI, PI_PROPERTIES } from '../../services/pi';
import './style.scss';

const Rating = ({ name, level, piMax, className, mini }) => {
  const pi = level <= piMax ? level : piMax;
  const width = (pi / piMax) * 100;
  const style = { width: `${width}%` };

  return (
    <div
      className={classnames(
        'm-pi-ratings__item',
        { 'm-pi-ratings--mini__item': mini },
        className
      )}
    >
      <div
        className={classnames('m-pi-ratings__item-name', {
          'm-pi-ratings--mini__item-name': mini,
        })}
      >
        {name}
      </div>
      <div
        className={classnames('m-pi-ratings__item-level', {
          'm-pi-ratings--mini__item-level': mini,
        })}
      >
        <div
          className={classnames('m-pi-ratings__item-level-bar', {
            'm-pi-ratings--mini__item-level-bar': mini,
          })}
          style={style}
        />
      </div>
      <div
        className={classnames('m-pi-ratings__item-level-label', {
          'm-pi-ratings--mini__item-level-label': mini,
        })}
      >
        {level}
      </div>
    </div>
  );
};

Rating.propTypes = {
  name: PropTypes.string.isRequired,
  mini: PropTypes.bool,
  className: PropTypes.string,
  level: PropTypes.number.isRequired,
  piMax: PropTypes.number.isRequired,
};

Rating.defaultProps = {
  className: '',
  mini: false,
};

const Ratings = ({ pi, piMax, displayAveragePi, mini }) => {
  const ratingsClassName = classnames('m-pi-ratings', {
    'm-pi-ratings--mini': mini,
  });
  const title = PI_PROPERTIES.map((name) => `${name}: ${pi[name]}`).join(',\n');

  return (
    <div className={ratingsClassName} title={title}>
      {displayAveragePi && (
        <Rating
          className="m-pi-ratings__item--average"
          name="Average PI"
          level={Math.round(getAveragePI(pi))}
          piMax={piMax}
          mini={mini}
        />
      )}
      {PI_PROPERTIES.map((name) => (
        <Rating
          name={name}
          level={pi[name] || 0}
          key={name}
          piMax={piMax}
          mini={mini}
        />
      ))}
    </div>
  );
};

Ratings.defaultProps = {
  displayAveragePi: false,
  mini: false,
};
Ratings.propTypes = {
  pi: PropTypes.shape({}).isRequired,
  piMax: PropTypes.number.isRequired,
  displayAveragePi: PropTypes.bool,
  mini: PropTypes.bool,
};

export default Ratings;
