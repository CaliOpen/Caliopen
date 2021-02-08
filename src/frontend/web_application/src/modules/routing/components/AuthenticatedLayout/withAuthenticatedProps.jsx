import React, { Component } from 'react';
import { WithSettings } from '../../../settings';
import { WithUser } from '../../../user';

export const withAuthenticatedProps = () => (C) => {
  class Wrapper extends Component {
    renderComponent({
      settings,
      isSettingsFetching,
      user,
      isUserFetching,
      didLostAuthSettings,
      didLostAuthUser,
    }) {
      const isFetching = isUserFetching || isSettingsFetching;
      const didLostAuth = didLostAuthSettings && didLostAuthUser;

      return (
        <C
          settings={settings}
          user={user}
          isFetching={isFetching}
          didLostAuth={didLostAuth}
          {...this.props}
        />
      );
    }

    render() {
      return (
        <WithSettings
          render={(settings, isSettingsFetching, didLostAuthSettings) => (
            <WithUser
              render={(user, isUserFetching, didLostAuthUser) =>
                this.renderComponent({
                  settings,
                  isSettingsFetching,
                  user,
                  isUserFetching,
                  didLostAuthSettings,
                  didLostAuthUser,
                })
              }
            />
          )}
        />
      );
    }
  }

  return Wrapper;
};
