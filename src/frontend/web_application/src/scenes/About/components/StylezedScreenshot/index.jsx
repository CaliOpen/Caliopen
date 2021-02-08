import React from 'react';
import PropTypes from 'prop-types';
import { withI18n } from '@lingui/react';
import desktopSrc from './assets/screenshot_desktop.svg';
import smartphoneSrc from './assets/screenshot_smartphone.svg';

const StylezedScreenshot = ({ className, i18n, type }) => {
  switch (type) {
    case 'smartphone':
      return (
        <img
          className={className}
          src={smartphoneSrc}
          alt={i18n._('screenshot.smartphone', null, {
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
          alt={i18n._('screenshot.desktop', null, {
            defaults: 'blurry screenshot of Caliopen for desktop',
          })}
        />
      );
  }
};

StylezedScreenshot.propTypes = {
  className: PropTypes.string,
  i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  type: PropTypes.oneOf(['smartphone', 'desktop']).isRequired,
};
StylezedScreenshot.defaultProps = {
  className: undefined,
};

export default withI18n()(StylezedScreenshot);
