import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Moment from 'react-moment';
import './style.scss';

const NB_DAYS_FROM_NOW = 3;

const renderDate = (date, locale) => {
  const dateAfter = new Date(date);
  dateAfter.setDate(dateAfter.getDate() + NB_DAYS_FROM_NOW);
  const dateClassName = 'm-day-message-list__date';

  return dateAfter.getTime() >= Date.now() ?
    (<Moment className={dateClassName} fromNow locale={locale}>{date}</Moment>) :
    (<Moment className={dateClassName} format="LL" locale={locale}>{date}</Moment>);
};

const DayMessageList = ({
  date, locale, className, children,
}) => (
  <div className="m-day-message-list">
    {renderDate(date, locale)}
    <div className={classnames('m-day-message-list__messages', className)}>{children}</div>
  </div>
);

DayMessageList.propTypes = {
  date: PropTypes.string.isRequired,
  locale: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};
DayMessageList.defaultProps = {
  locale: undefined,
  className: null,
};

export default DayMessageList;
