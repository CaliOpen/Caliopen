import * as React from 'react';
import PropTypes from 'prop-types';
import { withI18n, withI18nProps } from '@lingui/react';
import desktopSrc from './assets/screenshot_desktop.svg';
import smartphoneSrc from './assets/screenshot_smartphone.svg';

interface Props extends withI18nProps {
  className: string;
  type: 'smartphone' | 'desktop';
}

function StylezedScreenshot({ className, i18n, type }: Props) {
  switch (type) {
    case 'smartphone':
      return (
        <img
          className={className}
          src={smartphoneSrc}
          alt={i18n._('screenshot.smartphone', undefined, {
            defaults: 'blurry screenshot of Caliopen for smartphone',
          })}
        />
      );
    default:
    case 'desktop':
      return (
        <img
          className={className}
          src={desktopSrc}
          alt={i18n._('screenshot.desktop', undefined, {
            defaults: 'blurry screenshot of Caliopen for desktop',
          })}
        />
      );
  }
}

export default withI18n()(StylezedScreenshot);
