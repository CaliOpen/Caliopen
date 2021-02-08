import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withI18n } from '@lingui/react';
import { Icon } from '../../../../components';

@withI18n()
class PhoneDetails extends Component {
  static propTypes = {
    phone: PropTypes.shape({}).isRequired,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  constructor(props) {
    super(props);
    this.initTranslations();
  }

  initTranslations() {
    const { i18n } = this.props;
    this.typeTranslations = {
      work: i18n._('contact.phone_type.work', null, {
        defaults: 'Professional',
      }),
      home: i18n._('contact.phone_type.home', null, { defaults: 'Personal' }),
      other: i18n._('contact.phone_type.other', null, { defaults: 'Other' }),
    };
  }

  render() {
    const { phone } = this.props;

    return (
      <span className="m-phone-details">
        <Icon rightSpaced type="phone" />
        {phone.number}{' '}
        {phone.type && (
          <small>
            <em>{this.typeTranslations[phone.type]}</em>
          </small>
        )}
      </span>
    );
  }
}

export default PhoneDetails;
