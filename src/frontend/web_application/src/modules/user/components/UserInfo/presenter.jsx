import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { ContactAvatarLetter } from '../../../avatar';
import { WithSettings } from '../../../settings';
import './style.scss';

class UserInfo extends PureComponent {
  static propTypes = {
    user: PropTypes.shape({}),
    className: PropTypes.string,
  };

  static defaultProps = {
    user: {},
    className: undefined,
  };

  renderAvatar = () => {
    const { user } = this.props;
    const contact = user && user.contact;

    return (
      contact && (
        <WithSettings
          render={(settings) => {
            const format = settings.contact_display_format;

            return (
              <ContactAvatarLetter
                contact={contact}
                contactDisplayFormat={format}
              />
            );
          }}
        />
      )
    );
  };

  render() {
    const { user, className } = this.props;

    return (
      <div className={classnames('m-user-info', className)}>
        <div className="m-user-info__avatar">{this.renderAvatar()}</div>
        <div className="m-user-info__username">{user.name}</div>
      </div>
    );
  }
}

export default UserInfo;
