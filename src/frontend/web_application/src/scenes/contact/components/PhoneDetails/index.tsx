import * as React from 'react';
import PropTypes from 'prop-types';
import { withI18n } from '@lingui/react';
import { Icon } from '../../../../components';

// @ts-expect-error ts-migrate(1238) FIXME: Unable to resolve signature of class decorator whe... Remove this comment to see the full error message
@withI18n()
class PhoneDetails extends React.Component {
  static propTypes = {
    phone: PropTypes.shape({}).isRequired,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  typeTranslations: any;

  constructor(props) {
    super(props);
    this.initTranslations();
  }

  initTranslations() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'i18n' does not exist on type 'Readonly<{... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'phone' does not exist on type 'Readonly<... Remove this comment to see the full error message
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
