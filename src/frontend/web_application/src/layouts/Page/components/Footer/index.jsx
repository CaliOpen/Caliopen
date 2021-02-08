import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { getConfig } from '../../../../services/config';
import { Brand } from '../../../../components';
import './footer.scss';

class Footer extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
  };

  static defaultProps = {
    className: undefined,
  };

  render() {
    const { className } = this.props;
    const { version } = getConfig();

    return (
      <div className={classnames('l-footer', className)}>
        {/* <div className="l-footer__tips">
          <b>Astuce : </b>
          pour améliorer la confidentialitéde vos échanges, saviez-vous que vous pouviez lorem
          ipsum dolor sit amet!
        </div> */}

        <Brand className="l-footer__brand" theme="low" />
        <div className="l-footer__release">
          {version} - Be good. -{' '}
          <a href="/privacy-policy.html" target="_blank">
            Privacy Policy
          </a>
        </div>
      </div>
    );
  }
}

export default Footer;
