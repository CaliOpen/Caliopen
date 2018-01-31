import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { SIZE_SMALL, SIZE_MEDIUM } from '../ContactAvatarLetter';
import ParticipantIconLetter from '../ParticipantIconLetter';
import './style.scss';

const getAuthor = message => message.participants.find(participant => participant.type === 'From');

class AuthorAvatar extends PureComponent {
  static propTypes = {
    message: PropTypes.shape({}).isRequired,
    isSelected: PropTypes.bool,
    size: PropTypes.oneOf([SIZE_SMALL, SIZE_MEDIUM]),
  };
  static defaultProps = {
    isSelected: false,
    size: SIZE_SMALL,
  };

  render() {
    const { isSelected, size } = this.props;
    const participant = getAuthor(this.props.message);

    return (
      <div className={classnames('m-author-avatar', { 'm-author-avatar--small': size === SIZE_SMALL, 'm-author-avatar--medium': size === SIZE_MEDIUM })}>
        <ParticipantIconLetter
          className={classnames('m-author-avatar__letter', { 'm-author-avatar-small__letter-': size === 'small', 'm-author-avatar--medium__letter': size === 'medium' })}
          isSelected={isSelected}
          participant={participant}
        />
      </div>
    );
  }
}

export default AuthorAvatar;
