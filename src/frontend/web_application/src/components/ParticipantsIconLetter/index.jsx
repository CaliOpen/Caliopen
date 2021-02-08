// back from archives: https://github.com/CaliOpen/Caliopen/blob/1ca94e1443ae05807a073e8ddd41d2ad2541a7c6/src/frontend/web_application/src/scenes/DiscussionList/components/ParticipantsIcon/index.jsx
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { AvatarLetter } from '../../modules/avatar';
import './style.scss';

class ParticipantsIconLetter extends PureComponent {
  static propTypes = {
    labels: PropTypes.arrayOf(PropTypes.string).isRequired,
    className: PropTypes.string,
  };

  static defaultProps = {
    className: undefined,
  };

  render() {
    const { className, labels } = this.props;
    const hasMore = labels.length > 1;
    const iconClass = 'm-participants-icon__letter--1';

    return (
      <div className={classnames(className, 'm-participants-icon')}>
        <AvatarLetter
          className={classnames('m-participants-icon__letter', iconClass)}
          word={hasMore ? '+' : labels[0]}
        />
      </div>
    );
  }
}

export default ParticipantsIconLetter;
