import * as React from 'react';
import { Trans, withI18n, withI18nProps } from '@lingui/react';

function CaliopenAscii({ i18n }: withI18nProps) {
  return (
    <div>
      <Trans className="s-page-not-found__thanks" id="page_not_found.thank_you">
        Thank you for using
      </Trans>
      <pre
        className="s-page-not-found__ascii"
        aria-label={i18n._('page_not_found.caliopen-ascii', undefined, {
          defaults: 'Caliopen is draw using ASCIi art',
        })}
      >
        {`
        ▄▀▀▀▀▀▀▄                     █   ▀
  ▄▀▀▀▀▄ ▄████▄ ▌      ▄▀▀▀▀▄ ▄▀▀▀▀▄ █   ▄   ▄▀▀▀▀▄ ▄▀▀▀▀▄ ▄▀▀▀▄ ▄▀▀▀▀▄
 ▐ ▄██▄  ██████ ▌      █      █    █ █   █   █    █ █    █ █ ▄▀  █    █
 ▐ ▀██▀  ▀████▀ ▌      ▀▄▄▄▄▀ ▀▄▄▄▀█ ▀▄▄ ▀▄▄ ▀▄▄▄▄▀ █▄▄▄▄▀ ▀█▄▄▀ █    █
 ▄▀▄▄▄▄▀▀▄▄▄▄▄▄▀▄                                   █
`}
      </pre>
      <pre
        className="s-page-not-found__ascii-short"
        aria-label={i18n._('page_not_found.caliopen-ascii-logo', undefined, {
          defaults: 'Logo of Caliopen in ASCIi art',
        })}
      >
        {`
        ▄▀▀▀▀▀▀▄
  ▄▀▀▀▀▄ ▄████▄ ▌
 ▐ ▄██▄  ██████ ▌
 ▐ ▀██▀  ▀████▀ ▌
 ▄▀▄▄▄▄▀▀▄▄▄▄▄▄▀▄
`}
      </pre>
    </div>
  );
}

export default withI18n()(CaliopenAscii);
