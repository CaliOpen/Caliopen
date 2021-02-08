import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import getClassName from './services/stylesheet-helper';
import './style.scss';

const AvatarLetter = ({ word, className, isSelected }) => (
  <span
    className={classnames(
      className,
      isSelected ? 'm-letter--checked' : getClassName(word)
    )}
  />
);

AvatarLetter.propTypes = {
  word: PropTypes.string,
  className: PropTypes.string,
  isSelected: PropTypes.bool,
};

AvatarLetter.defaultProps = {
  word: null,
  className: null,
  isSelected: false,
};

export default AvatarLetter;
