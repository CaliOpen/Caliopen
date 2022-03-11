import * as React from 'react';
import { Trans, withI18n, withI18nProps } from '@lingui/react';
import { PageTitle } from '../../components';
import CaliopenAscii from './components/CaliopenAscii';
import './style.scss';

function PageNotFound({ i18n }: withI18nProps) {
  return (
    <div className="s-page-not-found">
      <PageTitle
        title={i18n._(/* i18n */ 'page_not_found.page_title', undefined, {
          message: 'Page not found',
        })}
      />
      <h2 className="s-page-not-found__title">
        <Trans id="page_not_found.title" message="Unicorn not found" />
      </h2>

      <CaliopenAscii />
    </div>
  );
}

export default withI18n()(PageNotFound);
