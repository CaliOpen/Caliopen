import * as React from 'react';
import { Trans, withI18n, withI18nProps } from '@lingui/react';
import { Link, PageTitle } from 'src/components';
import CaliopenAscii from './components/CaliopenAscii';
import './style.scss';

function PageError({ i18n }: withI18nProps) {
  return (
    <div className="s-error">
      <PageTitle
        title={i18n._('unexpected_error.page_title', undefined, {
          defaults: 'Page not found',
        })}
      />
      <h2>
        <Trans id="error-boundary.title">Something went wrong.</Trans>
      </h2>
      <div>
        <Trans id="error-boundary.short-description">
          We are are very sorry, an error occured on your account. This should
          never happens (but sometimes it does). Please retry later or send us a
          feedback.
        </Trans>
      </div>
      <div>
        <Link
          href="https://feedback.caliopen.org"
          target="_blank"
          rel="noreferrer noopener"
        >
          <Trans id="error-boundary.link-to-feedback">Send us a feedback</Trans>
        </Link>
      </div>
      <CaliopenAscii />
    </div>
  );
}

export default withI18n()(PageError);
