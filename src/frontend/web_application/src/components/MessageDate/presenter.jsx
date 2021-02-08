import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Moment from 'moment';
import './style.scss';

class MessageDate extends PureComponent {
  static propTypes = {
    dateTime: PropTypes.instanceOf(Moment).isRequired,
  };

  static defaultProps = {};

  renderDate = () => {
    const { dateTime } = this.props;

    const diffDays = Moment().diff(dateTime, 'days');
    const diffYear = Moment().diff(dateTime, 'years');

    switch (true) {
      default:
      case diffDays === 0:
        return dateTime.format('LT'); // 11:00
      case diffDays > 0 && diffDays <= 7:
        return dateTime.format('dddd'); // monday
      case diffYear === 0 && diffDays > 7:
        return dateTime.format('LL'); // 'March 22, 2018'
      case diffYear >= 1:
        return dateTime.format('YYYY'); // 2017
    }
  };

  render() {
    const { dateTime } = this.props;

    return (
      <time title={dateTime.format('LLL')} dateTime={dateTime.format('')}>
        <span className="m-message-date__date">{this.renderDate()}</span>
      </time>
    );
  }
}

export default MessageDate;
