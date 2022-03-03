import * as React from 'react';
import { withI18n, withI18nProps } from '@lingui/react';
import { Icon } from 'src/components';
import { Phone } from 'src/modules/contact/types';

interface Props extends withI18nProps {
  phone: Phone;
}
function PhoneDetails({ phone, i18n }: Props) {
  const typeTranslations = {
    work: i18n._('contact.phone_type.work', undefined, {
      defaults: 'Professional',
    }),
    home: i18n._('contact.phone_type.home', undefined, {
      defaults: 'Personal',
    }),
    other: i18n._('contact.phone_type.other', undefined, { defaults: 'Other' }),
  };

  return (
    <span className="m-phone-details">
      <Icon rightSpaced type="phone" />
      {phone.number}{' '}
      {phone.type && (
        <small>
          <em>{typeTranslations[phone.type]}</em>
        </small>
      )}
    </span>
  );
}

export default withI18n()(PhoneDetails);
