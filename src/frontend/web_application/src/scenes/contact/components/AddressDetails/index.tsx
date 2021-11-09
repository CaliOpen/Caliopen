import * as React from 'react';
import { withI18n, withI18nProps } from '@lingui/react';
import { Icon } from 'src/components';
import { ContactCommon } from 'src/modules/contact/types';
import './style.scss';

interface Props extends withI18nProps {
  address: NonNullable<ContactCommon['addresses']>[number];
}

function AddressDetails({ i18n, address }: Props) {
  const addressTypesTranslations = {
    work: i18n._('contact.address_type.work', undefined, {
      defaults: 'Professional',
    }),
    home: i18n._('contact.address_type.home', undefined, {
      defaults: 'Personal',
    }),
    other: i18n._('contact.address_type.other', undefined, {
      defaults: 'Other',
    }),
  };

  return (
    <span className="m-address-details">
      <Icon type="map-marker" rightSpaced />
      <address className="m-address-details__postal-address">
        {address.street}
        {address.street && ', '}
        {address.postal_code}
        {address.postal_code && ' '}
        {address.city}
        {address.city && ' '}
        {address.country}
        {address.country && ' '}
        {address.region}
      </address>{' '}
      {(address.label || address.type) && (
        <small>
          <em>
            ({address.label}
            {address.label && ' '}
            {address.type && addressTypesTranslations[address.type]})
          </em>
        </small>
      )}
    </span>
  );
}

export default withI18n()(AddressDetails);
