import * as React from 'react';
import { withI18n, withI18nProps } from '@lingui/react';
import { Icon } from 'src/components';
import { IM } from 'src/modules/contact/types';

interface Props extends withI18nProps {
  im: IM;
}
function ImDetails({ im, i18n }: Props) {
  const imTypesTranslations = {
    work: i18n._(/* i18n */ 'contact.im_type.work', undefined, {
      message: 'Professional',
    }),
    home: i18n._(/* i18n */ 'contact.im_type.home', undefined, {
      message: 'Personal',
    }),
    other: i18n._(/* i18n */ 'contact.im_type.other', undefined, {
      message: 'Other',
    }),
  };

  return (
    <span className="m-im-details">
      <Icon rightSpaced type="comment" />
      {im.address}{' '}
      {im.type && (
        <small>
          <em>{imTypesTranslations[im.type]}</em>
        </small>
      )}
    </span>
  );
}

export default withI18n()(ImDetails);
