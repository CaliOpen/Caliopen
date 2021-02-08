import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import { Trans } from '@lingui/react';
import classnames from 'classnames';
import { formatName } from '../../../../services/contact';
import { ContactAvatarLetter } from '../../../../modules/avatar';
import { WithSettings } from '../../../../modules/settings';

import './style.scss';

class ProfileInfo extends PureComponent {
  static propTypes = {
    user: PropTypes.shape({}),
    className: PropTypes.string,
  };

  static defaultProps = {
    user: undefined,
    className: undefined,
  };

  render() {
    const { user, className } = this.props;

    return (
      <WithSettings
        render={(settings) => {
          const format = settings.contact_display_format;
          const locale = settings.default_locale;
          const contact = user && user.contact;

          return (
            <div className={classnames('m-user-profile-details', className)}>
              <div className="m-user-profile-details__header">
                <div className="m-user-profile-details__avatar-wrapper">
                  {user && (
                    <ContactAvatarLetter
                      contact={user.contact}
                      contactDisplayFormat={format}
                      className="m-user-profile-details__avatar"
                    />
                  )}
                </div>
              </div>
              <div className="m-user-profile-details__name">
                <h3 className="m-user-profile-details__title">
                  {user && user.name}
                </h3>
                <h4 className="m-user-profile-details__subtitle">
                  {user && user.contact && formatName({ contact, format })}
                </h4>
                <p>
                  <Trans id="user.profile.subscribed_date">Subscribed on</Trans>{' '}
                  {user && (
                    <Moment
                      className="m-user-profile-details__subscribed-date"
                      format="ll"
                      locale={locale}
                    >
                      {user.date_insert}
                    </Moment>
                  )}
                </p>
              </div>

              {/* "rank" is not implemt by now
              <div className="m-user-profile-details__rank">
                <div className="m-user-profile-details__rank-badge" />
                <div className="m-user-profile-details__rank-info">
                  <h4 className="m-user-profile-details__rank-title">fake rank</h4>
                  <Link to=""><Trans id="user.action.improve_rank">Improve your rank</Trans></Link>
                </div>
              </div>
              */}
            </div>
          );
        }}
      />
    );
  }
}

export default ProfileInfo;
