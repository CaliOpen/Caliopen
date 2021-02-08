import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import { Brand, Link, Icon } from '../../components';
import { getConfig } from '../../services/config';
import { BackgroundImage } from '../../modules/pi';
import './style.scss';

const AboutPage = ({ children }) => {
  const { version } = getConfig();

  return (
    <BackgroundImage context="secure" className="l-about-page">
      <div className="l-about-page__content">{children}</div>
      <footer className="l-about-page__footer">
        <ul className="l-about-page__footer-list">
          <li className="l-about-page__footer-entry">
            <Brand className="l-about-page__footer-brand" />
            <span> - Be good.</span>
          </li>
          <li className="l-about-page__footer-entry">
            <Link href="https://www.caliopen.org" target="_blank">
              <Trans id="about.footer.link-website">About</Trans>
            </Link>
          </li>
          <li className="l-about-page__footer-entry">
            <Link href="https://www.caliopen.org/blog" target="_blank">
              <Trans id="about.footer.link-blog">Blog</Trans>
            </Link>
          </li>
          <li className="l-about-page__footer-entry">
            <Link href="https://github.com/CaliOpen/Caliopen" target="_blank">
              <Icon type="github" />{' '}
              <Trans id="about.footer.link-source-code">Open Source</Trans>
            </Link>
          </li>
          <li className="l-about-page__footer-entry">
            <Link href="/privacy-policy.html" target="_blank">
              <Trans id="about.footer.link-privacy-policy">
                Privacy Policy
              </Trans>
            </Link>
          </li>
          <li className="l-about-page__footer-entry">{version}</li>
        </ul>
      </footer>
    </BackgroundImage>
  );
};

AboutPage.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AboutPage;
