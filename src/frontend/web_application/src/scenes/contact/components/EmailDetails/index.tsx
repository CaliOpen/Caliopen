import * as React from 'react';
import { withI18n, withI18nProps } from '@lingui/react';
import { Icon } from 'src/components';
import { Email } from 'src/modules/contact/types';

interface Props extends withI18nProps {
  email: Email;
}
function EmailDetails({ email, i18n }: Props) {
  const emailTypesTranslations = {
    work: i18n._(/* i18n */ 'contact.email_type.work', undefined, {
      message: 'Professional',
    }),
    home: i18n._(/* i18n */ 'contact.email_type.home', undefined, {
      message: 'Personal',
    }),
    other: i18n._(/* i18n */ 'contact.email_type.other', undefined, {
      message: 'Other',
    }),
  };

  const address = !email.is_primary ? (
    email.address
  ) : (
    <strong
      title={i18n._(/* i18n */ 'contact.primary', undefined, {
        message: 'Primary',
      })}
    >
      {email.address}
    </strong>
  );

  return (
    <span className="m-email-details">
      <Icon rightSpaced type="envelope" />
      {address}{' '}
      <small>
        <em>{emailTypesTranslations[email.type]}</em>
      </small>
    </span>
  );
}

export default withI18n()(EmailDetails);
