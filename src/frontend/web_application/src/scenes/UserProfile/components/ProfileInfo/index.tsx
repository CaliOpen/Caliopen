import * as React from 'react';
import Moment from 'react-moment';
import { Trans } from '@lingui/react';
import { formatName } from 'src/modules/contact';
import { ContactAvatarLetter } from 'src/modules/avatar';
import { useSettings } from 'src/modules/settings';

import './style.scss';
import { useUser } from 'src/modules/user';

function ProfileInfo(): JSX.Element {
  const settings = useSettings();
  const { user } = useUser();
  const format = settings.contact_display_format;
  const locale = settings.default_locale;
  const contact = user?.contact;

  return (
    <div className="m-user-profile-details">
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
        <h3 className="m-user-profile-details__title">{user && user.name}</h3>
        <h4 className="m-user-profile-details__subtitle">
          {contact && formatName({ contact, format })}
        </h4>
        <p>
          <Trans id="user.profile.subscribed_date" message="Subscribed on" />{' '}
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
                  <Link to=""><Trans id="user.action.improve_rank" message="Improve your rank" /></Link>
                </div>
              </div>
              */}
    </div>
  );
}

export default ProfileInfo;
