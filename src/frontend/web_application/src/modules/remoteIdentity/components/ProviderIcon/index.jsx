import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { withI18n } from '@lingui/react';
import providerSrc from './assets/providers.svg';
import { capitalize } from '../../../../services/capitalize';
import {
  PROVIDER_GMAIL,
  PROVIDER_MASTODON,
  PROVIDER_TWITTER,
} from '../../model/Identity';
import './style.scss';

const PROVIDER_SIZE_NORMAL = 'normal';

@withI18n()
class ProviderIcon extends PureComponent {
  static propTypes = {
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    className: PropTypes.string,
    providerName: PropTypes.oneOf([
      PROVIDER_GMAIL,
      PROVIDER_TWITTER,
      PROVIDER_MASTODON,
    ]).isRequired,
    // XXX: refactor me
    size: PropTypes.oneOf([PROVIDER_SIZE_NORMAL]),
  };

  static defaultProps = {
    className: undefined,
    size: undefined,
  };

  render() {
    const { className, providerName, i18n, size } = this.props;
    const imageClassName = classnames(className, {
      'm-provider-icon--normal': size === PROVIDER_SIZE_NORMAL,
    });

    return (
      <img
        className={imageClassName}
        src={`${providerSrc}#${providerName}`}
        alt={i18n._(
          'remote_identity.provider-logo',
          { name: capitalize(providerName) },
          { defaults: '{name} logo' }
        )}
      />
    );
  }
}

export default ProviderIcon;
