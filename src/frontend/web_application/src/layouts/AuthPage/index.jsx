import React from 'react';
import PropTypes from 'prop-types';
import { Brand } from '../../components';
import { getConfig } from '../../services/config';
import NotificationCenter from '../Page/components/NotificationCenter';
import './style.scss';

function AuthPage({ children }) {
  const { version, motd } = getConfig();

  return (
    <div className="l-auth-page">
      <div className="l-auth-page__content">
        <header className="l-auth-page__header">
          <Brand className="l-auth-page__brand" theme="low" />
        </header>
        <section className="l-auth-page__form">{children}</section>
        <footer className="l-auth-page__footer">
          {motd && <div>{motd}</div>}
          <div>
            {version} - Be good. -{' '}
            <a href="/privacy-policy.html" target="_blank">
              Privacy Policy
            </a>
          </div>
        </footer>
      </div>
      <NotificationCenter />
    </div>
  );
}

AuthPage.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthPage;
