import { Trans } from '@lingui/react';
import classnames from 'classnames';
import * as React from 'react';
import Brand from '../Brand';
import Link from '../Link';
import Spinner from '../Spinner';
import './style.scss';

function Activity() {
  const activities = [
    <Trans id="app-loader.activity.macaroons">
      Baking macaroons, wait a moment please
    </Trans>,
    <Trans id="app-loader.activity.cats">
      Feeding the cats, wait a moment please
    </Trans>,
    <Trans id="app-loader.activity.chicken">
      Telling the chicken to get out from the kitchen, wait a moment please
    </Trans>,
    <Trans id="app-loader.activity.beckett">
      Waiting for Godot, he'll soon be there, trust me
    </Trans>,
    <Trans id="app-loader.activity.newcat">
      Trying to tell if there is a new cat in house, wait a moment please
    </Trans>,
    <Trans id="app-loader.activity.ipaddr">
      Forging new ip addresses, wait a moment please
    </Trans>,
    <Trans id="app-loader.activity.oof">
      Configuring OpenOffice firewall, wait a moment please
    </Trans>,
    <Trans id="app-loader.activity.trolls">
      Correcting wrong people on the Internet, wait a moment please
    </Trans>,
  ];
  const now = new Date();
  const hour = now.getHours();
  const nb = Math.ceil((hour + 1) / (24 / activities.length));

  return activities[nb - 1];
}

interface Props {
  className?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  hasFailure?: boolean;
  fallbackUrl?: string;
}

function AppLoader({
  children,
  className,
  hasFailure = false,
  isLoading = true,
  fallbackUrl = '/',
}: Props): React.ReactNode {
  if (!hasFailure && !isLoading) {
    return children;
  }

  return (
    <div className={classnames(className, 'm-app-loader')}>
      <div>
        <div className="m-app-loader__header">
          <Brand className="m-app-loader__brand" />
        </div>
        <div className="m-app-loader__content">
          {isLoading ? (
            <>
              <Spinner svgTitleId="app-spinner" isLoading />
              <Activity />
            </>
          ) : (
            <>
              <p>
                <Trans id="app-loader.feedback.failure">
                  Something went wrong. Are you offline ?
                </Trans>
              </p>
              <p>
                <Link href={fallbackUrl}>
                  <Trans id="app-loader.action.retry">
                    Please click here to retry
                  </Trans>
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AppLoader;
