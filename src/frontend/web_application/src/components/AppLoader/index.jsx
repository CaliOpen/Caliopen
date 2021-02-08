import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Trans } from '@lingui/react';
import Spinner from '../Spinner';
import Brand from '../Brand';
import Link from '../Link';
import './style.scss';

class AppLoader extends Component {
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    isLoading: PropTypes.bool,
    hasFailure: PropTypes.bool,
    fallbackUrl: PropTypes.string,
  };

  static defaultProps = {
    children: null,
    className: undefined,
    hasFailure: false,
    isLoading: true,
    fallbackUrl: '/',
  };

  renderBrand = () => (
    <div className="m-app-loader__header">
      <Brand className="m-app-loader__brand" />
    </div>
  );

  renderActivity = () => {
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
  };

  renderLoader() {
    return this.renderContent(
      <Fragment>
        <Spinner isLoading />
        {this.renderActivity()}
      </Fragment>
    );
  }

  renderFailure() {
    const { fallbackUrl } = this.props;

    return this.renderContent(
      <Fragment>
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
      </Fragment>
    );
  }

  renderContent(children) {
    const { className } = this.props;

    return (
      <div className={classnames(className, 'm-app-loader')}>
        <div>
          {this.renderBrand()}
          <div className="m-app-loader__content">{children}</div>
        </div>
      </div>
    );
  }

  render() {
    const { hasFailure, isLoading } = this.props;

    if (!hasFailure && !isLoading) {
      return this.props.children;
    }

    if (isLoading) {
      return this.renderLoader();
    }

    return this.renderFailure();
  }
}

export default AppLoader;
