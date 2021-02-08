import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Trans, withI18n } from '@lingui/react';
import { PageTitle } from '../../components';
import './style.scss';

@withI18n()
class PageNotFound extends PureComponent {
  static propTypes = {
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  static defaultProps = {};

  render() {
    const { i18n } = this.props;

    return (
      <div className="s-page-not-found">
        <PageTitle
          title={i18n._('page_not_found.page_title', null, {
            defaults: 'Page not found',
          })}
        />
        <h2 className="s-page-not-found__title">
          <Trans id="page_not_found.title">Unicorn not found</Trans>
        </h2>
        <div>
          <Trans
            className="s-page-not-found__thanks"
            id="page_not_found.thank_you"
          >
            Thank you for using
          </Trans>
          <pre
            className="s-page-not-found__ascii"
            aria-label={i18n._('page_not_found.caliopen-ascii', null, {
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
            aria-label={i18n._('page_not_found.caliopen-ascii-logo', null, {
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
      </div>
    );
  }
}

export default PageNotFound;
