import React, { PropTypes } from 'react';
import classnames from 'classnames';
import { getContactStylesheetClass } from './services/stylesheet-helper';
import './style.scss';

const ContactIconLetter = ({ contact, className }) => (
  <span className={classnames(className, getContactStylesheetClass(contact))} />
);

ContactIconLetter.propTypes = {
  contact: PropTypes.shape({}).isRequired,
  className: PropTypes.string,
};

export default ContactIconLetter;
