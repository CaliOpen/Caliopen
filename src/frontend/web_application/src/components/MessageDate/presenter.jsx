import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Moment from 'moment';
import TextBlock from '../TextBlock';

class MessageDate extends PureComponent {
  static propTypes = {
    dateTime: PropTypes.instanceOf(Moment).isRequired,
  };
  static defaultProps = {
  };

  render() {
    const { dateTime } = this.props;

    return (
      <time
        title={dateTime.format('LLL')}
        dateTime={dateTime.format('')}
      >
        <TextBlock inline>{dateTime.format('ll')}</TextBlock>
        {' '}
        <TextBlock inline>{dateTime.format('LT')}</TextBlock>
      </time>
    );
  }
}

export default MessageDate;
