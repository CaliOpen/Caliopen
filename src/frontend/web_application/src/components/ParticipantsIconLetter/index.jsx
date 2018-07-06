// back from archives: https://github.com/CaliOpen/Caliopen/blob/1ca94e1443ae05807a073e8ddd41d2ad2541a7c6/src/frontend/web_application/src/scenes/DiscussionList/components/ParticipantsIcon/index.jsx
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { AvatarLetter } from '../../modules/avatar';
import Icon from '../Icon';
import './style.scss';

const ParticipantsIcon = ({ labels, className }) => {
  const hasMore = labels.length > 4;
  const participants = labels.slice(0, hasMore ? 3 : 4);
  const iconClass = `m-participants-icon__letter--${hasMore ? 4 : participants.length}`;

  return (
    <div className={classnames(className, 'm-participants-icon')}>
      {
        participants.map(participant => (
          <AvatarLetter className={classnames('m-participants-icon__letter', iconClass)} word={participant} />
        ))
      }
      {
        hasMore && <Icon className={classnames('m-participants-icon__letter', iconClass)} type="plus" />
      }
    </div>
  );
};

ParticipantsIcon.propTypes = {
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
  className: PropTypes.string,
};

export default ParticipantsIcon;
