import React, { PropTypes } from 'react';
import classnames from 'classnames';
import ContactIconLetter from '../ContactIconLetter';
import './style.scss';

const ContactAvatarLetter = ({ contact, size }) => {
  const classNameModifiers = {
    small: 'm-avatar--small',
    medium: 'm-avatar--medium',
    large: 'm-avatar--large',
    xlarge: 'm-avatar--xlarge',
  };
  const classNameSize = Object.keys(classNameModifiers).reduce((prev, key) => {
    if (!prev && key === size) {
      return classNameModifiers[key];
    }

    return prev;
  }, undefined);

  const letterClassNameSize = classNameSize ? `${classNameSize}__letter` : null;

  return (
    <div className={classnames('m-avatar', classNameSize)}>
      <ContactIconLetter
        className={classnames('m-avatar__letter', letterClassNameSize)}
        contact={contact}
      />
    </div>
  );
};

ContactAvatarLetter.propTypes = {
  contact: PropTypes.shape({}),
  size: PropTypes.string,
};

export default ContactAvatarLetter;
