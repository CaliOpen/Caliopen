import * as React from 'react';
import { Trans, withI18n, withI18nProps } from '@lingui/react';

function CaliopenAscii({ i18n }: withI18nProps) {
  return (
    <div>
      <span className="s-page-not-found__thanks">
        <Trans id="page_not_found.thank_you" message="Thank you for using" />
      </span>
      <pre
        className="s-page-not-found__ascii"
        aria-label={i18n._(
          /* i18n */ 'page_not_found.caliopen-ascii',
          undefined,
          {
            message: 'Caliopen is draw using ASCIi art',
          }
        )}
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
        aria-label={i18n._(
          /* i18n */ 'page_not_found.caliopen-ascii-logo',
          undefined,
          {
            message: 'Logo of Caliopen in ASCIi art',
          }
        )}
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
