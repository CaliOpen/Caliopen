import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Moment from 'react-moment';
import { Trans } from 'lingui-react';
import './style.scss';

const renderDate = (date, locale) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateClassName = 'm-day-message-list__date';

  return date >= today ?
    (<Trans className={dateClassName} id="message-list.today">Today</Trans>) :
    (<Moment className={dateClassName} format="LL" locale={locale}>{date}</Moment>);
};

const DayMessageList = ({
  date, locale, className, children,
}) => (
  <div className="m-day-message-list">
    {renderDate(new Date(date), locale)}
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
